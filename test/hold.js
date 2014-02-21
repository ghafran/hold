process.env.NODE_ENV = 'test';

var expect = require('chai').expect,
should = require('chai').should;

var epoch = require('../lib/hold');

describe('hold', function() {

    describe('functions', function() {
        
        it('basic', function(done){
        
            expect(1).to.be.equal(1);
            done();
        });
    });
});
