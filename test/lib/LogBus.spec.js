/*global describe, it*/
var LogBus = require('../../lib/LogBus');
var sinon = require('sinon');
var expect = require('unexpected')
    .installPlugin(require('unexpected-sinon'));
var async = require('async');

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

        expect(logBus.subscriptions, 'to have length', 0);

        var subscription = logBus.subscribe({ type: 'foo' }, function () {});

        expect(logBus.subscriptions, 'to satisfy', [
            {
                subscriptionId: expect.it('to be a number'),
                matcher: expect.it('to be a function'),
                callback: expect.it('to be a function')
            }
        ]);

        logBus.unsubscribe(subscription);

        expect(logBus.subscriptions, 'to have length', 0);
    });
    describe('relaying events from another logbus via http', function () {
        function createExpressApp(middleware) {
            var app = require('express')();
            app.use('/log', middleware);
            var server = app.listen(0);
            var address = server.address();
            return {
                hostname: address.address,
                port: address.port,
                host: address.address + ':' + address.port,
                url: 'http://' + address.address + ':' + address.port,
                app: app
            };
        }

        it('should be able to relay events via http', function (done) {
            var masterLogBus = new LogBus();
            var listenerSpy = sinon.spy();

            var workerOneLogBus = new LogBus();
            var workerTwoLogBus = new LogBus();

            var workerOne = createExpressApp(workerOneLogBus.createExpressHandler());
            var workerTwo = createExpressApp(workerTwoLogBus.createExpressHandler());

            masterLogBus.subscribe({ type: 'log' }, listenerSpy);

            async.waterfall([
                function (callback) {
                    masterLogBus.fetchEventsFromHttp({ url: workerOne.url + '/log' });
                    masterLogBus.fetchEventsFromHttp({ url: workerTwo.url + '/log' });
                    setTimeout(callback, 10);
                },
                function (callback) {
                    workerOneLogBus.emit('log', 'worker 1');
                    workerOneLogBus.emit('metric', 'worker 1');
                    workerTwoLogBus.emit('log', 'worker 2 event 1');
                    workerTwoLogBus.emit('log', 'worker 2 event 2');
                    setTimeout(callback, 5);
                },
                function (callback) {
                    expect(listenerSpy, 'was called thrice');
                    expect(listenerSpy, 'was called with', { type: 'log', message: 'worker 1' });
                    expect(listenerSpy, 'was called with', { type: 'log', message: 'worker 2 event 1' });
                    expect(listenerSpy, 'was called with', { type: 'log', message: 'worker 2 event 2' });
                    callback();
                }
            ], done);
        });
    });
});
