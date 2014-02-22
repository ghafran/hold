process.env.NODE_ENV = 'test';

var expect = require('chai').expect,
    should = require('chai').should;

var Hold = require('../lib/hold');

describe('hold cases', function() {

    it('returns function', function(done) {

        var hold = new Hold();
        expect(hold).to.be.a('function');
        done();
    });

    it('basic', function(done) {

        var hold = new Hold();
        hold(function(until) {

            until(null, 'done');
        }, function(err, result) {

            expect(result).to.equal('done');
            done();
        });
    });
    
    it('basic with expire option', function(done) {

        var hold = new Hold(1000);
        hold(function(until) {

            until(null, 'done');
        }, function(err, result) {

            expect(result).to.equal('done');
            done();
        });
    });
    
    it('basic with options object', function(done) {

        var hold = new Hold({ expires: 1000 });
        hold(function(until) {

            until(null, 'done');
        }, function(err, result) {

            expect(result).to.equal('done');
            done();
        });
    });
    
    it('expire', function(done) {

        var hold = new Hold({ expires: 10 });
        var result1;
        var result2;
        var result3;
        
        var work = function(until) {

            until(null, new Date().getTime());
        };
        
        hold(work, function(err, result) {
            
            result1 = result;
        });
        
        hold(work, function(err, result) {
            
            result2 = result;
            expect(result2).to.equal(result1);
        });
        
        setTimeout(function(){
            hold(work, function(err, result) {
    
                result3 = result;
                expect(result3).to.not.equal(result1); // result should have expired
                done();
            });
        }, 20);

    });

    it('concurrent', function(done) {

        var hold = new Hold();
        var workCount = 0;
        var resultCount = 0;

        var work = function(until) {

            workCount++;
            setTimeout(function(u){
                u(null, 'done');
            }, 10, until);
        };

        var finish = function(err, result) {
            resultCount++;
        };
        
        // make multiple simulateous calls to hold
        for (var i = 0; i < 10; i++) {
            hold(work, finish);
        }

        setTimeout(function() {
            expect(workCount).to.equal(1); // only the first call did work
            expect(resultCount).to.equal(10); // all calls got the result from first call
            done();
        }, 20);
    });
});
