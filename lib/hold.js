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
        
        _work = work;
        _done = done;
        
        if (_results === null || _results === undefined || hasExpired() === true) {
        
            if (_locked === true) {
                
                _callBuffer.push(done);
                return;
            } else {
                
                _locked = true;
            }
            
            _until = function(){
                _results = arguments;
                _gotResultOn = new Date().getTime();
                _locked = false;
                _done.apply(this, _results);
                
                for(var i = 0; i < _callBuffer.length; i++){
                    _callBuffer[i]();
                }
                _callBuffer = 0;
            };
            _work(_until);
        } else {
            
            // return cached results
            _done.apply(this, _results);
        }
    }
    
    function hasExpired(){
        
        var output = false;
        var diff = new Date().getTime() - (_gotResultOn || 0);
        if (diff > (_expires)) {
            output = true;
        }
        return output;
    }

    return hold;
};

    