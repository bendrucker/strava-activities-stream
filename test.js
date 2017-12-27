'use strict'

const test = require('tape')
const nock = require('nock')
const moment = require('moment')
const ActivitiesStream = require('./')

const strava = nock('https://www.strava.com', {
  reqheaders: {
    authorization: 'Bearer <TOKEN>'
  }
})

test('simple', function (t) {
  const start = moment().subtract(1, 'months')
  const endOfFirstPage = moment().subtract(2, 'weeks')
  const end = new Date()

  strava
    .get(path(start))
    .reply(200, [
      {id: 1, start_date: start.toDate()},
      {id: 2, start_date: start.clone().add(2, 'days').toDate()},
      {id: 3, start_date: endOfFirstPage.toDate()}
    ])

  strava
    .get(path(endOfFirstPage))
    .reply(200, [
      {id: 4, start_date: end}
    ])

  strava
    .get(path(end))
    .reply(200, [])

  const activities = []
  new ActivitiesStream({
    token: '<TOKEN>',
    after: start.toDate()
  })
  .on('data', activities.push.bind(activities))
  .on('error', t.end)
  .on('end', function () {
    t.equal(activities.length, 4, 'has 4 records')
    t.deepEqual(activities.map(a => a.id), [1, 2, 3, 4], 'has correct ids')
    t.end()
  })
})

test('before', function (t) {
  const start = moment().subtract(1, 'months')
  const endOfFirstPage = moment().subtract(2, 'weeks')
  const before = endOfFirstPage.clone().subtract(1, 'hours')

  strava
    .get(path(start) + '&before=' + toSeconds(before))
    .reply(200, [
      {id: 1, start_date: start.toDate()},
      {id: 2, start_date: start.clone().add(2, 'days').toDate()},
      {id: 3, start_date: endOfFirstPage.toDate()}
    ])

  const activities = []
  new ActivitiesStream({
    token: '<TOKEN>',
    after: start.toDate(),
    before
  })
  .on('data', activities.push.bind(activities))
  .on('error', t.end)
  .on('end', function () {
    t.equal(activities.length, 2, 'has 2 records')
    t.deepEqual(activities.map(a => a.id), [1, 2], 'has correct ids')
    t.end()
  })
})

function path (after) {
  return '/api/v3/athlete/activities?after=' + toSeconds(after)
}

function toSeconds (date) {
  return Math.ceil(Number(date) / 1000)
}

