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

    this.expires = options.expires;

    function hold(work, done) {
        
        this.work = work;
        this.done = done;
        this.until = function(){
            this.done.apply(this, arguments);
        };
        
        work(this.until);
    }

    return hold;
};
