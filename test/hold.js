process.env.NODE_ENV = 'test';

var expect = require('chai').expect,
    should = require('chai').should;

var Hold = require('../lib/hold');

describe('no key', function() {

    it('returns function', function(done) {

        var hold = new Hold();
        expect(hold).to.be.a('function');
        done();
    });

    it('basic', function(done) {

        var hold = new Hold();
        var data = new Date().getTime();
        hold(function(until) {

            until(null, data);
        }, function(err, result) {

            expect(result).to.equal(data);
            done();
        });
    });
    
    it('basic with expire option', function(done) {

        var hold = new Hold(1000);
        var data = new Date().getTime();
        hold(function(until) {

            until(null, data);
        }, function(err, result) {

            expect(result).to.equal(data);
            done();
        });
    });
    
    it('basic with options object', function(done) {

        var hold = new Hold({ expires: 1000 });
        var data = new Date().getTime();
        hold(function(until) {

            until(null, data);
        }, function(err, result) {

            expect(result).to.equal(data);
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
        var data = new Date().getTime();
        
        var work = function(until) {

            workCount++;
            setTimeout(function(u){
                u(null, data);
            }, 5, until);
        };

        var finish = function(err, result) {
            resultCount++;
            expect(result).to.equal(data);
        };
        
        // make multiple simulateous calls to hold
        for (var i = 0; i < 10; i++) {
            hold(work, finish);
        }

        setTimeout(function() {
            expect(workCount).to.equal(1); // only the first call did work
            expect(resultCount).to.equal(10); // all calls got the result from first call
            done();
        }, 30);
    });
    
    it('on error use next caller', function(done) {

        var hold = new Hold({ expires: 10 });
        var data = new Date().getTime();
        
        hold(function(until) {

            setTimeout(function(u){
                u(new Error('fake error'));
            }, 5, until);
        }, function(err, result) {
            
            expect(err).to.exist;
        });
        
        hold(function(until) {

            setTimeout(function(u){
                u(null, data);
            }, 5, until);
        }, function(err, result) {
            
            expect(err).to.not.exist;
            expect(result).to.equal(data);
        });
        
        hold(function(until) {

            setTimeout(function(u){
                u(null, new Date().getTime());
            }, 2, until);
        }, function(err, result) {
            
            expect(err).to.not.exist;
            expect(result).to.equal(data);
            done();
        });
    });
    
    it('concurrent errors', function(done) {

        var hold = new Hold();
        var workCount = 0;
        var workFailedCount = 0;
        var resultCount = 0;
        var resultFailedCount = 0;
        var data = new Date().getTime();
        
        var work = function(until) {

            workCount++;
            setTimeout(function(u){
                u(null, data);
            }, 5, until);
        };
        
        var workFailed = function(until) {

            workFailedCount++;
            setTimeout(function(u){
                u(new Error('fake error'));
            }, 5, until);
        };
        
        var finish = function(err, result) {
            resultCount++;
            expect(err).to.not.exist;
            expect(result).to.equal(data);
        };
        
        var finishFailed = function(err, result) {
            resultFailedCount++;
            expect(err).to.exist;
        };
        
        // make multiple simulateous calls to hold
        hold(workFailed, finishFailed); // fail first
        hold(workFailed, finishFailed); // fail second
        for (var i = 0; i < 10; i++) {
            hold(work, finish);
        }

        setTimeout(function() {
            
            expect(workFailedCount).to.equal(2);
            expect(resultFailedCount).to.equal(2);
            expect(workCount).to.equal(1);
            expect(resultCount).to.equal(10);
            done();
        }, 30);
    });
    
    it('timeout', function(done) {

        var hold = new Hold({ timeout: 10 });

        hold(function(until) {

            // until never called
        }, function(err, result) {
            
            expect(err).to.exist;
            done();
        });
    });
    
    it('concurrent timeout', function(done) {

        var hold = new Hold({ timeout: 5 });
        var workCount = 0;
        var workFailedCount = 0;
        var resultCount = 0;
        var resultFailedCount = 0;
        var data = new Date().getTime();
        
        var work = function(until) {

            workCount++;
            setTimeout(function(u){
                u(null, data);
            }, 5, until);
        };
        
        var workFailed = function(until) {

            workFailedCount++;
            // never call until
        };
        
        var finish = function(err, result) {
            resultCount++;
            expect(err).to.not.exist;
            expect(result).to.equal(data);
        };
        
        var finishFailed = function(err, result) {
            resultFailedCount++;
            expect(err).to.exist;
        };
        
        // make multiple simulateous calls to hold
        hold(workFailed, finishFailed); // fail first
        hold(workFailed, finishFailed); // fail second
        for (var i = 0; i < 10; i++) {
            hold(work, finish);
        }

        setTimeout(function() {
            
            expect(workFailedCount).to.equal(2);
            expect(resultFailedCount).to.equal(2);
            expect(workCount).to.equal(1);
            expect(resultCount).to.equal(10);
            done();
        }, 30);
    });
});

describe('with key', function() {

    it('basic', function(done) {

        var hold = new Hold();
        var data = new Date().getTime();
        hold('key', function(until) {

            until(null, data);
        }, function(err, result) {

            expect(result).to.equal(data);
            done();
        });
    });
    
    it('basic with expire option', function(done) {

        var hold = new Hold(1000);
        var data = new Date().getTime();
        hold('key', function(until) {

            until(null, data);
        }, function(err, result) {

            expect(result).to.equal(data);
            done();
        });
    });
    
    it('basic with options object', function(done) {

        var hold = new Hold({ expires: 1000 });
        var data = new Date().getTime();
        hold('key', function(until) {

            until(null, data);
        }, function(err, result) {

            expect(result).to.equal(data);
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
        
        hold('key', work, function(err, result) {
            
            result1 = result;
        });
        
        hold('key', work, function(err, result) {
            
            result2 = result;
            expect(result2).to.equal(result1);
        });
        
        setTimeout(function(){
            hold('key', work, function(err, result) {
    
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
        var data = new Date().getTime();
        
        var work = function(until) {

            workCount++;
            setTimeout(function(u){
                u(null, data);
            }, 5, until);
        };

        var finish = function(err, result) {
            resultCount++;
            expect(result).to.equal(data);
        };
        
        // make multiple simulateous calls to hold
        for (var i = 0; i < 10; i++) {
            hold('key', work, finish);
        }

        setTimeout(function() {
            expect(workCount).to.equal(1); // only the first call did work
            expect(resultCount).to.equal(10); // all calls got the result from first call
            done();
        }, 30);
    });
    
    it('on error use next caller', function(done) {

        var hold = new Hold({ expires: 10 });
        var data = new Date().getTime();
        
        hold('key', function(until) {

            setTimeout(function(u){
                u(new Error('fake error'));
            }, 5, until);
        }, function(err, result) {
            
            expect(err).to.exist;
        });
        
        hold('key', function(until) {

            setTimeout(function(u){
                u(null, data);
            }, 5, until);
        }, function(err, result) {
            
            expect(err).to.not.exist;
            expect(result).to.equal(data);
        });
        
        hold('key', function(until) {

            setTimeout(function(u){
                u(null, new Date().getTime());
            }, 2, until);
        }, function(err, result) {
            
            expect(err).to.not.exist;
            expect(result).to.equal(data);
            done();
        });
    });
    
    it('concurrent errors', function(done) {

        var hold = new Hold();
        var workCount = 0;
        var workFailedCount = 0;
        var resultCount = 0;
        var resultFailedCount = 0;
        var data = new Date().getTime();
        
        var work = function(until) {

            workCount++;
            setTimeout(function(u){
                u(null, data);
            }, 5, until);
        };
        
        var workFailed = function(until) {

            workFailedCount++;
            setTimeout(function(u){
                u(new Error('fake error'));
            }, 5, until);
        };
        
        var finish = function(err, result) {
            resultCount++;
            expect(err).to.not.exist;
            expect(result).to.equal(data);
        };
        
        var finishFailed = function(err, result) {
            resultFailedCount++;
            expect(err).to.exist;
        };
        
        // make multiple simulateous calls to hold
        hold('key', workFailed, finishFailed); // fail first
        hold('key', workFailed, finishFailed); // fail second
        for (var i = 0; i < 10; i++) {
            hold('key', work, finish);
        }

        setTimeout(function() {
            
            expect(workFailedCount).to.equal(2);
            expect(resultFailedCount).to.equal(2);
            expect(workCount).to.equal(1);
            expect(resultCount).to.equal(10);
            done();
        }, 30);
    });
    
    it('timeout', function(done) {

        var hold = new Hold({ timeout: 10 });

        hold('key', function(until) {

            // until never called
        }, function(err, result) {
            
            expect(err).to.exist;
            done();
        });
    });
    
    it('concurrent timeout', function(done) {

        var hold = new Hold({ timeout: 5 });
        var workCount = 0;
        var workFailedCount = 0;
        var resultCount = 0;
        var resultFailedCount = 0;
        var data = new Date().getTime();
        
        var work = function(until) {

            workCount++;
            setTimeout(function(u){
                u(null, data);
            }, 5, until);
        };
        
        var workFailed = function(until) {

            workFailedCount++;
            // never call until
        };
        
        var finish = function(err, result) {
            resultCount++;
            expect(err).to.not.exist;
            expect(result).to.equal(data);
        };
        
        var finishFailed = function(err, result) {
            resultFailedCount++;
            expect(err).to.exist;
        };
        
        // make multiple simulateous calls to hold
        hold('key', workFailed, finishFailed); // fail first
        hold('key', workFailed, finishFailed); // fail second
        for (var i = 0; i < 10; i++) {
            hold('key', work, finish);
        }

        setTimeout(function() {
            
            expect(workFailedCount).to.equal(2);
            expect(resultFailedCount).to.equal(2);
            expect(workCount).to.equal(1);
            expect(resultCount).to.equal(10);
            done();
        }, 30);
    });
});

describe('multiple keys', function() {

    it('concurrent different keys', function(done) {

        var hold = new Hold();
        var workCount = 0;
        var resultCount = 0;
        var data = 0;
        var results = [];
        
        var work = function(until) {

            workCount++;
            until(null, data++);
        };

        var finish = function(err, result) {
            resultCount++;
            expect(results).to.not.contain(result);
            results.push(result);
        };
        
        var s = function(i, work, finish){
            
            hold(i.toString(), work, finish);
        };
            
        // make multiple simulateous calls to hold
        for (var i = 0; i < 10; i++) {
            s(i, work, finish);
        }

        setTimeout(function() {
            expect(workCount).to.equal(10); // all calls should of did work
            expect(resultCount).to.equal(10); // all calls got a result
            done();
        }, 30);
    });
    
    it('concurrent same keys', function(done) {

        var hold = new Hold();
        var workCount = 0;
        var resultCount = 0;
        var data = 0;

        var work = function(until) {

            workCount++;
            until(null, data++); // we are adding so next work will give different answer
        };

        var finish = function(err, result) {
            resultCount++;
            expect(result).to.equal(0);
        };
        
        var s = function(i, work, finish){
            
            hold('key', work, finish);
        };
            
        // make multiple simulateous calls to hold
        for (var i = 0; i < 10; i++) {
            s(i, work, finish);
        }

        setTimeout(function() {
            expect(workCount).to.equal(1); // all calls should of did work
            expect(resultCount).to.equal(10); // all calls got a result
            done();
        }, 30);
    });
});