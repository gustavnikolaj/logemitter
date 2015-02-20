/*global describe, it*/
var sinon = require('sinon');
var expect = require('unexpected')
    .installPlugin(require('unexpected-sinon'));
var relayLogEvents = require('../../lib/relayLogEvents');
var EventEmitter = require('events').EventEmitter;

describe('relayLogEvents', function () {
    it('should be a function', function () {
        expect(relayLogEvents, 'to be a function');
    });
    it('should relay events from one EventEmitter to another', function (done) {
        var listenerSpy = sinon.spy();
        var firstEmitter = new EventEmitter();
        var secondEmitter = new EventEmitter();

        firstEmitter.on('log', listenerSpy);

        relayLogEvents(firstEmitter, secondEmitter);

        secondEmitter.emit('log', 'someMessage');

        setImmediate(function () {
            expect(listenerSpy, 'was called with', 'someMessage');
            done();
        });
    });
    it('should not relay non-log events', function (done) {
        var listenerSpy = sinon.spy();
        var anotherListenerSpy = sinon.spy();
        var firstEmitter = new EventEmitter();
        var secondEmitter = new EventEmitter();

        firstEmitter.on('log', listenerSpy);
        firstEmitter.on('anotherEvent', anotherListenerSpy);

        relayLogEvents(firstEmitter, secondEmitter);

        secondEmitter.emit('log', 'someMessage');
        secondEmitter.emit('anotherEvent', 'anotherMessage');

        setImmediate(function () {
            expect(listenerSpy, 'was called with', 'someMessage');
            expect(anotherListenerSpy, 'was not called');
            done();
        });
    });
});
