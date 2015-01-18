var sinon = require('sinon');
var expect = require('unexpected')
    .installPlugin(require('unexpected-sinon'));
var logemitter = require('../');
var EventEmitter = require('events').EventEmitter;

describe('logemitter', function () {
    describe('relayEvents', function () {
        var relayEvents = logemitter.relayEvents;
        it('should be a function', function () {
            expect(relayEvents, 'to be a function');
        });
        it('should relay events from one EventEmitter to another', function (done) {
            var listenerSpy = sinon.spy();
            var firstEmitter = new EventEmitter();
            var secondEmitter = new EventEmitter();

            firstEmitter.on('someEvent', listenerSpy);

            relayEvents('someEvent', firstEmitter, secondEmitter);

            secondEmitter.emit('someEvent', 'someMessage');

            setTimeout(function () {
                expect(listenerSpy, 'was called with', 'someMessage');
                done();
            }, 1);
        });
    });
});
