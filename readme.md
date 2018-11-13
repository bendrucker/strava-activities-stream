# strava-activities-stream [![Build Status](https://travis-ci.org/bendrucker/strava-activities-stream.svg?branch=master)](https://travis-ci.org/bendrucker/strava-activities-stream) [![Greenkeeper badge](https://badges.greenkeeper.io/bendrucker/strava-activities-stream.svg)](https://greenkeeper.io/)

> Fetch Strava activities as a Readable stream


## Install

```
npm install --save strava-activities-stream
```


## Usage

```js
const ActivitiesStream = require('strava-activities-stream')

new ActivitiesStream({
  token: 'my auth token',
  after: new Date(new Date() - 1000 * 60 * 60 * 24 * 30) // 30 days ago
})
.on('data', console.log)
```

## API

#### `new ActivitiesStream(options)` -> `readable`

##### options

###### token

*Required*  
Type: `string`  

A Strava API access token.

##### after

Type: `date`  
Default: `new Date(0)`  

A date when the stream will begin.

##### before

Type: `date`  
Default: `undefined`  

A date when the stream will end. By default, the stream will continue until no more activities are available.


## License

MIT © [Ben Drucker](http://bendrucker.me)
