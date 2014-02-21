module.exports = function() {

    var held = {}

        function _releaser(key, exec) {
            return function(done) {
                return function() {
                    _release(key, exec)
                    if (done) done.apply(null, arguments)
                }
            }
        }

        function _release(key, exec) {
            var i = held[key].indexOf(exec) //should usually be 0

            if (!~i) return

            held[key].splice(i, 1)

            //note, that the next holder isn't triggered until next tick,
            //so it's always after the released callback
            if (isheld(key)) process.nextTick(function() {
                held[key][0](_releaser(key, held[key][0]))
            })
            else delete held[key]
        }

        function _hold(key, exec) {
            if (isheld(key)) return held[key].push(exec), false
            return held[key] = [exec], true
        }

        function hold(key, exec) {
            
            if (_hold(key, exec)) { 
                exec(_releaser(key, exec))
            } else {
                // make call wait here
            }
        }

        function isheld(key) {
            return Array.isArray(held[key]) ? !! held[key].length : false
        }

    hold.isheld = isheld

    return hold
}