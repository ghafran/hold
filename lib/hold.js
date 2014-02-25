function Hold(options) {
    
    if (!(this instanceof Hold)) {
        return new Hold(options);
    }
    
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
    
    var _self = this;
    _self.workActive = null;
    _self.doneActive = null;
    _self.results = null;
    _self.expires = options.expires;
    _self.timeout = options.timeout;
    _self.locked = false;
    _self.gotResultOn = 0;
    _self.callBuffer = [];
    _self.timeoutPointer = null;

    _self.start = function(work, done) {
        
        if (_self.results === null || _self.results === undefined || _self.hasExpired() === true) {
            
            // need to call work function
            if (_self.locked === true) {
                
                // track reference to held caller
                _self.callBuffer.push({ work: work, done: done });
                return;
            } else {
                
                // lock work function
                _self.locked = true;
            }
            
            _self.startWork(work, done);
        } else {
            
            // return cached results to caller immediately
            done.apply(_self, _self.results);
        }
    };
    
    _self.startWork = function(work, done){
        _self.workActive = work;
        _self.doneActive = done;
        _self.workActive(_self.until);
        if(_self.timeout !== -1) {
            _self.timeoutPointer = setTimeout(_self.callTimeout, _self.timeout);
        }
    };
    
    _self.until = function(){
        
        // clear timeout pointer
        if(_self.timeout !== -1) {
            clearTimeout(_self.timeoutPointer);
        }
        
        if(arguments[0] !== null && arguments[0] !== undefined){
            
            _self.callFailed(arguments);
            
        } else {

            _self.callSucceeded(arguments);
        }
    };
    
    _self.callFailed = function(args){
        
        // remove results from cache
        _self.results = null;
        
        // reset timestamp of cached results
        _self.gotResultOn = 0;
        
        // keep work locked
        _self.locked = true;
        
        // return results to first caller
        _self.doneActive.apply(_self, args);
        
        // have next caller re-try
        if(_self.callBuffer.length > 0){

            _self.startWork(_self.callBuffer[0].work, _self.callBuffer[0].done);
            
            // remove next caller from buffer
            _self.callBuffer.shift();
        }
    };
    
    _self.callSucceeded = function(args){
        
        // cache results
        _self.results = args;
        
        // record timestamp of results
        _self.gotResultOn = new Date().getTime();
        
        // unlock work function
        _self.locked = false;
        
        // return results to first caller
        _self.doneActive.apply(_self, _self.results);
        
        // return results to held callers
        for(var i = 0; i < _self.callBuffer.length; i++){
            _self.callBuffer[i].done.apply(_self, _self.results);
        }
        _self.callBuffer = 0;
    };
    
    _self.callTimeout = function(){
        
        // remove results from cache
        _self.results = null;
        
        // reset timestamp of cached results
        _self.gotResultOn = 0;
        
        // keep work locked
        _self.locked = true;
        
        // return results to first caller
        _self.doneActive(new Error('The work function timed out.'));
        
        // have next caller re-try
        if(_self.callBuffer.length > 0){

            _self.startWork(_self.callBuffer[0].work, _self.callBuffer[0].done);
            
            // remove next caller from buffer
            _self.callBuffer.shift();
        }
    };
    
    _self.hasExpired = function(){
        
        if(_self.expires === -1) {
            return false;
        }
        
        var diff = new Date().getTime() - (_self.gotResultOn || 0);
        if (diff > (_self.expires)) {
            return true;
        } else {
            return false;
        }
    };

    return _self;
}

module.exports = function(options){
    
    var hold = new Hold(options);
    return hold.start;
};

    