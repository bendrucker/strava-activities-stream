'use strict'

const { Readable } = require('stream')
const get = require('simple-get')
const JSONStream = require('JSONStream')

module.exports = class ActivitiesStream extends Readable {
  constructor ({ token, after = new Date(0), before }) {
    super({ objectMode: true })
    this.token = token
    this.last = after
    this.before = before && new Date(before)
    this.reading = false
  }

  _read () {
    if (this.reading) return

    this.reading = true
    this.page(err => {
      if (err) return this.emit('error', err)
      this.reading = false
      this._read()
    })
  }

  page (callback) {
    const after = toSeconds(this.last)
    const request = {
      url: 'https://www.strava.com/api/v3/athlete/activities?after=' + after,
      headers: {
        authorization: 'Bearer ' + this.token
      }
    }

    if (this.before) request.url += '&before=' + toSeconds(this.before)

    get(request, (err, res) => {
      if (err) return this.emit('error', err)
      if (res.statusCode > 299) {
        return this.emit('error', new Error('Received ' + res.statusCode))
      }

      let last
      let done
      res
        .pipe(JSONStream.parse('*'))
        .on('data', activity => {
          if (done) return
          last = new Date(activity.start_date)

          if (this.before && last >= this.before) {
            done = true
            return
          }

          this.push(activity)
        })
        .on('error', callback)
        .on('end', () => {
          if (!last || done) return this.push(null)
          this.last = last
          callback()
        })
    })
  }
}

function toSeconds (date) {
  return Math.ceil(Number(date) / 1000)
}
