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
            var anotherListenerSpy = sinon.spy();
            var firstEmitter = new EventEmitter();
            var secondEmitter = new EventEmitter();

            firstEmitter.on('someEvent', listenerSpy);

            relayEvents('someEvent', firstEmitter, secondEmitter);

            secondEmitter.emit('someEvent', 'someMessage');
            secondEmitter.emit('anotherEvent', 'anotherMessage');

            setTimeout(function () {
                expect(listenerSpy, 'was called with', 'someMessage');
                expect(anotherListenerSpy, 'was not called');
                done();
            }, 1);
        });
        it('should relay matched events from one EventEmitter to another', function (done) {
            var someListenerSpy = sinon.spy();
            var anotherListenerSpy = sinon.spy();
            var negativeListenerSpy = sinon.spy();
            var firstEmitter = new EventEmitter();
            var secondEmitter = new EventEmitter();

            firstEmitter.on('someEvent', someListenerSpy);
            firstEmitter.on('anotherEvent', anotherListenerSpy);
            firstEmitter.on('negativeEvent', negativeListenerSpy);

            relayEvents(/(some|another)Event/, firstEmitter, secondEmitter);

            secondEmitter.emit('someEvent', 'someMessage');
            secondEmitter.emit('anotherEvent', 'anotherMessage');
            secondEmitter.emit('negativeEvent', 'negativeMessage');

            setTimeout(function () {
                expect(someListenerSpy, 'was called with', 'someMessage');
                expect(anotherListenerSpy, 'was called with', 'anotherMessage');
                expect(negativeListenerSpy, 'was not called');
                done();
            }, 1);
        });
    });
});
