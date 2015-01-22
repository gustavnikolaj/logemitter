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

        setTimeout(function () {
            expect(subscribeSpy, 'was called twice');
            expect(subscribeSpy, 'was called with', { type: 'log', message: 'foo' });
            expect(subscribeSpy, 'was called with', { type: 'log', message: 'qux' });
            done();
        }, 1);
    });
    it('should allow you to read a stream of events from a query', function (done) {
        var logBus = new LogBus();
        var streamSpy = sinon.spy();

        var stream = logBus.stream({ type: 'log' });

        stream.on('data', streamSpy);

        logBus.emit('log', { type: 'log', message: 'Foo' });
        logBus.emit('log', { type: 'log', message: 'Bar' });
        logBus.emit('log', { type: 'log', message: 'Baz' });

        setTimeout(function () {
            expect(streamSpy, 'was called thrice');
            expect(streamSpy, 'was called with', { type: 'log', message: 'Foo' });
            expect(streamSpy, 'was called with', { type: 'log', message: 'Bar' });
            expect(streamSpy, 'was called with', { type: 'log', message: 'Baz' });
            stream.close();
            done();
        }, 1);
    });
    it('should handle adding and removing streams from the subscriptions array', function (done) {
        var logBus = new LogBus();
        expect(logBus.subscriptions, 'to have length', 0);

        var stream = logBus.stream({ type: 'log' });
        expect(logBus.subscriptions, 'to have length', 1);

        stream.close();
        setTimeout(function () {
            expect(logBus.subscriptions, 'to have length', 0);
            done();
        });
    });
    it.skip('map non log events to log', function (done) {
        var logBus = new LogBus();
        var subscribeSpy = sinon.spy();

        logBus.subscribe({ type: 'log' }, subscribeSpy);

        logBus.emit('log', 'foo');
        logBus.emit('metric', 'bar');
        logBus.emit('log', 'qux');

        setTimeout(function () {
            expect(subscribeSpy, 'was called thrice');
            expect(subscribeSpy, 'was called with', { type: 'log', message: 'foo' });
            expect(subscribeSpy, 'was called with', { type: 'metric', message: 'bar' });
            expect(subscribeSpy, 'was called with', { type: 'log', message: 'qux' });
            done();
        }, 1);
    });
});
