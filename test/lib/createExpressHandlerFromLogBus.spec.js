/*global describe, it*/
var expect = require('unexpected')
    .installPlugin(require('unexpected-express'));
var createExpressHandler = require('../../lib/createExpressHandlerFromLogBus');
var LogBus = require('../../lib/LogBus');

expect.addAssertion('to yield a response of', function (expect, subject, value, done) {
    expect(
        createExpressHandler(subject.logBus),
        'to yield exchange',
        {
            request: subject,
            response: value
        },
        done
    );
});

describe('createExpressHandlerFromLogBus', function () {
    it('should export a function', function () {
        expect(createExpressHandler, 'to be a function');
    });
    it('should export a function that returns a function', function () {
        var expressHandler = createExpressHandler();
        expect(expressHandler, 'to be a function');
        expect(expressHandler, 'to have arity', 3);
    });
    it('when called with query ', function (done) {
        var logBus = new LogBus();
        setImmediate(function () {
            logBus.emit('log', { type: 'log', message: 'message 1' });
            logBus.emit('log', { type: 'log', message: 'message 2' });
            logBus.emit('log', { type: 'log', message: 'message 3' });
            logBus.emit('log', { type: 'log', message: 'message 4' });
        });
        expect({
            logBus: logBus,
            url: '/',
            query: {
                type: 'log',
                timeout: '1'
            }
        }, 'to yield a response of', {
            headers: {
            },
            body: [
                '{"type":"log","message":"message 1"}',
                '{"type":"log","message":"message 2"}',
                '{"type":"log","message":"message 3"}',
                '{"type":"log","message":"message 4"}',
                ''
            ].join('\n')
        }, done);
    });
    it('when called with query ', function (done) {
        var logBus = new LogBus();
        setImmediate(function () {
            logBus.emit('log', { type: 'log', message: 'message 1' });
            logBus.emit('log', { type: 'log', foo: true, message: 'message 2' });
            logBus.emit('log', { type: 'log', message: 'message 3' });
            logBus.emit('log', { type: 'log', message: 'message 4' });
        });
        expect({
            logBus: logBus,
            url: '/?foo&timeout=1',
        }, 'to yield a response of', {
            headers: {
            },
            body: [
                '{"type":"log","foo":true,"message":"message 2"}',
                ''
            ].join('\n')
        }, done);
    });
});
