process.env.NODE_ENV = 'test';

var expect = require('chai').expect,
should = require('chai').should;

var Hold = require('../lib/hold');

describe('hold cases', function() {

    it('returns function', function(done){
        
        var hold = new Hold();
        
        expect(hold).to.be.a('function');
        done();
    });
    
    it('basic', function(done){
        
        var hold = new Hold();
        hold(function(until){
            
            until(null, 'done');
        }, function(err, result){
            
            expect(result).to.equal('done');
            done();
        });
    });
});
