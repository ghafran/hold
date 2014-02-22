hold
==============
Still in development!!!! Does not currently work...

Ensures async function is only called once and caches results for other calls.

[![Build Status](https://secure.travis-ci.org/socialradar/hold.png)](http://travis-ci.org/socialradar/hold)

## Installation

    $ npm install hold

## Simple Usage

code example:

```js
var Hold = require('hold');
var hold = Hold();

hold(function (until) {
  
  // only first call enters here
  doSomething(function(err, result){
    
    // share output of doSomething to all other callers
    until(err, result);
  });
}, function(err, result){
    
    // all waiting calls are now given output of doSomething here, includeing first caller
    // results are cached until expiration is reached
    console.log(result);
}, 1000);

function doSomething(callback){
    setTimeout(function(callback){ 
        var result = "i finished";
        callback(null, result); 
    }, 1000, callback);
}

```
