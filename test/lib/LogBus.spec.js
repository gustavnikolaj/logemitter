/*global describe, it*/
var LogBus = require('../../lib/LogBus');
var sinon = require('sinon');
var expect = require('unexpected')
    .installPlugin(require('unexpected-sinon'));

describe('LogBus', function () {
    it('should allow you to subscribe to events by a query', function (done) {
        var logBus = new LogBus();
        var subscribeSpy = sinon.spy();

        logBus.subscribe({ type: 'log' }, subscribeSpy);

        logBus.emit('log', { type: 'log', message: 'foo' });
        logBus.emit('log', { type: 'metric', message: 'bar' });
        logBus.emit('log', { type: 'log', message: 'qux' });

        setImmediate(function () {
            expect(subscribeSpy, 'was called twice');
            expect(subscribeSpy, 'was called with', { type: 'log', message: 'foo' });
            expect(subscribeSpy, 'was called with', { type: 'log', message: 'qux' });
            done();
        });
    });
    it('should map string events to object events', function (done) {
        var logBus = new LogBus();
        var subscribeSpy = sinon.spy();

        logBus.subscribe({ type: 'log' }, subscribeSpy);

        logBus.emit('log', 'foo');

        setImmediate(function () {
            expect(subscribeSpy, 'was called once');
            expect(subscribeSpy, 'was called with', { type: 'log', message: 'foo' });
            done();
        });
    });
    it('should map non log events to log', function (done) {
        var logBus = new LogBus();
        var subscribeSpy = sinon.spy();

        logBus.on('log', subscribeSpy);

        logBus.emit('log', 'foo');
        logBus.emit('metric', 'bar');
        logBus.emit('log', 'qux');

        setImmediate(function () {
            expect(subscribeSpy, 'was called thrice');
            expect(subscribeSpy, 'was called with', { type: 'log', message: 'foo' });
            expect(subscribeSpy, 'was called with', { type: 'metric', message: 'bar' });
            expect(subscribeSpy, 'was called with', { type: 'log', message: 'qux' });
            done();
        });
    });
    it('should return a subscription id when subscribing', function () {
        var logBus = new LogBus();

        var subscriptionId = logBus.subscribe('foo', 'bar');

        expect(subscriptionId, 'to be a number');
    });

    it('should be able to subscribe and unsubscribe', function () {
        var logBus = new LogBus();

        expect(logBus.subscriptions, 'to equal', Object.create(null));

        var subscription = logBus.subscribe('foo', 'bar');

        expect(logBus.subscriptions[subscription], 'to be an object');

        logBus.unsubscribe(subscription);

        expect(logBus.subscriptions, 'to equal', Object.create(null));
    });
});
