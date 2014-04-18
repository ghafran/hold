[![Build Status](https://secure.travis-ci.org/socialradar/hold.png)](http://travis-ci.org/socialradar/hold)

hold
==============
Ensures async function is only called once and caches results for other calls.

When multiple calls are made simulateously, only the first call is allowed to perform the work. 

All other callers are held until the caller doing work has completed and shares the results to all held callers.

```js
var Hold = require('hold');
var hold = Hold();
hold(work, results);
```

## Installation

    $ npm install hold

## Usage

code example:

```js
var Hold = require('hold');
var hold = Hold();

hold(function (done) {
  
  // only one call enters here at any given time
  doSomething(function(err, result){
    
    // callback with results of doSomething
    done(err, result);
  });
}, function(err, result){
    
    // all waiting calls are now given output of doSomething here, including first caller
    // results are cached until expiration is reached
    console.log(result);
});

function doSomething(callback){
    setTimeout(function(callback){ 
        var result = "i finished";
        callback(null, result); 
    }, 1000, callback);
}
```

## Usage With Key

If multiple holds are required based on a key, a `key` parameter can be passed as first argument.

```js
var Hold = require('hold');
var hold = Hold();

hold('key', function (done) {
  
  // only one call enters here at any given time for a given key
  doSomething(function(err, result){
    
    // callback with results of doSomething
    done(err, result);
  });
}, function(err, result){
    
    // all waiting calls are now given output of doSomething here, including first caller
    // results are cached until expiration is reached
    console.log(result);
});

function doSomething(callback){
    setTimeout(function(callback){ 
        var result = "i finished";
        callback(null, result); 
    }, 1000, callback);
}
```

## options

`options` in an object with the following possible properties:

* `expire`: time in milliseconds indicating how long to cache the results of the caller that did the work. default is to never expire.
* `timeout`: if specified, will timeout work callers and return timeout error, and let the next caller perform the work.

```js
var Hold = require('hold');
var hold = Hold({
    expires: 60 * 1000, // expire cache in 60 seconds
    timeout: 90 * 1000 // timeout worker calls in 90 seconds
});
```

```js
var Hold = require('hold');
var hold = Hold(60 * 1000); // expire cache in 60 seconds
```