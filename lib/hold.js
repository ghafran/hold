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

    var _work;
    var _until;
    var _results;
    var _done;
    var _expires = options.expires;
    var _locked = false;
    var _gotResultOn = 0;
    var _callBuffer = [];

    function hold(work, done) {
        
        if (_results === null || _results === undefined || hasExpired() === true) {
            
            // need to call work function
            if (_locked === true) {
                
                // track reference to held caller
                _callBuffer.push(done);
                return;
            } else {
                
                // lock work function
                _locked = true;
            }
            
            _work = work;
            _done = done;
        
            _until = function(){
                
                // cache results
                _results = arguments;
                
                // record timestamp of results
                _gotResultOn = new Date().getTime();
                
                // unlock work function
                _locked = false;
                
                // return results to first caller
                _done.apply(this, _results);
                
                // return results to held callers
                for(var i = 0; i < _callBuffer.length; i++){
                    _callBuffer[i].apply(this, _results);
                }
                _callBuffer = 0;
            };
            _work(_until);
        } else {
            
            // return cached results to caller immediately
            done.apply(this, _results);
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

    