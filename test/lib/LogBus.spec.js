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
    it.skip('should allow you to read a stream of events from a query', function () {
        var logBus = new LogBus();

        var stream = logBus.streamQuery({ query: 'foobar' });

        // buffer events from stream

        logBus.emit('log', 'event that match the query');
        logBus.emit('log', 'event that match the query');
        logBus.emit('log', 'event that match the query');

        expect('buffered result', 'to equal', 'expected result, stringified event as json one per line');
    });
    it.skip('map non log events to log', function () {
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
