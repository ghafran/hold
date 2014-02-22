module.exports = function(options) {

    if (options === null || options === undefined) {
        options = {};
    }
    if (typeof options === 'number') {
        options = {
            expires: options
        };
    }
    if (options.expires === null || options.expires === undefined) {
        options.expires = -1;
    }
    
    if (options.timeout === null || options.timeout === undefined) {
        options.timeout = -1;
    }

    var _workActive;
    var _doneActive;
    var _results;
    var _expires = options.expires;
    var _timeout = options.timeout;
    var _locked = false;
    var _gotResultOn = 0;
    var _callBuffer = [];
    var _timeoutPointer;

    function hold(work, done) {
        
        if (_results === null || _results === undefined || hasExpired() === true) {
            
            // need to call work function
            if (_locked === true) {
                
                // track reference to held caller
                _callBuffer.push({ work: work, done: done });
                return;
            } else {
                
                // lock work function
                _locked = true;
            }
            
            startWork(work, done);
        } else {
            
            // return cached results to caller immediately
            done.apply(this, _results);
        }
    }
    
    function startWork(work, done){
        _workActive = work;
        _doneActive = done;
        _workActive(until);
        if(_timeout !== -1) {
            _timeoutPointer = setTimeout(callTimeout, _timeout);
        }
    }
    
    function until(){
        
        // clear timeout pointer
        if(_timeout !== -1) {
            clearTimeout(_timeoutPointer);
        }
        
        if(arguments[0] !== null && arguments[0] !== undefined){
            
            callFailed(arguments);
            
        } else {

            callSucceeded(arguments);
        }
    }
    
    function callFailed(args){
        
        // remove results from cache
        _results = null;
        
        // reset timestamp of cached results
        _gotResultOn = 0;
        
        // keep work locked
        _locked = true;
        
        // return results to first caller
        _doneActive.apply(this, args);
        
        // have next caller re-try
        if(_callBuffer.length > 0){

            startWork(_callBuffer[0].work, _callBuffer[0].done);
            
            // remove next caller from buffer
            _callBuffer.shift();
        }
    }
    
    function callSucceeded(args){
        
        // cache results
        _results = args;
        
        // record timestamp of results
        _gotResultOn = new Date().getTime();
        
        // unlock work function
        _locked = false;
        
        // return results to first caller
        _doneActive.apply(this, _results);
        
        // return results to held callers
        for(var i = 0; i < _callBuffer.length; i++){
            _callBuffer[i].done.apply(this, _results);
        }
        _callBuffer = 0;
    }
    
    function callTimeout(){
        
        // remove results from cache
        _results = null;
        
        // reset timestamp of cached results
        _gotResultOn = 0;
        
        // keep work locked
        _locked = true;
        
        // return results to first caller
        _doneActive(new Error('The work function timed out.'));
        
        // have next caller re-try
        if(_callBuffer.length > 0){

            startWork(_callBuffer[0].work, _callBuffer[0].done);
            
            // remove next caller from buffer
            _callBuffer.shift();
        }
    }
    
    function hasExpired(){
        
        if(_expires === -1) {
            return false;
        }
        
        var diff = new Date().getTime() - (_gotResultOn || 0);
        if (diff > (_expires)) {
            return true;
        } else {
            return false;
        }
    }

    return hold;
};

    