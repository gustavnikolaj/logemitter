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
});