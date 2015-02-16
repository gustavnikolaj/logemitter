/* global describe, it, beforeEach, afterEach */
var sinon = require('sinon');
var expect = require('unexpected')
    .installPlugin(require('unexpected-sinon'));
var HttpEventAggregator = require('../../lib/HttpEventAggregator');
var LogBus = require('../../lib/LogBus');
var EventEmitter = require('events').EventEmitter;
var async = require('async');
var express = require('express');

var extend = require('util-extend');

function printLog(name) {
    return function (log) {
        var logCopy = extend({}, log);
        delete logCopy.type;
        var message = logCopy.message;
        delete logCopy.message;
        var parts = Object.keys(logCopy).map(function (key) {
            return '' + key + ': ' + logCopy[key];
        });
        console.log(name + ': ', [message].concat(parts).join(', '));
    };
}

function createExpressApp(middleware, callback) {
    var app = express();
    app.use('/log', middleware);
    var server = app.listen(0, function () {
        var address = server.address();
        callback(null, {
            hostname: address.address,
            port: address.port,
            host: address.address + ':' + address.port,
            url: 'http://' + address.address + ':' + address.port + '/log',
            app: app
        });
    });
}

describe('lib/HttpEventAggregator', function () {
    it('should be an EventEmitter', function () {
        expect(new HttpEventAggregator(), 'to be an', EventEmitter);
    });
    it('given a list of urls and a subscription, it should aggregate events', function (done) {
        this.timeout(10000);
        var workerOneLogBus = new LogBus();
        var workerTwoLogBus = new LogBus();

        var workerOne;
        var workerTwo;

        var httpEventAggregator;

        async.waterfall([
            function (callback) {
                async.parallel([
                    function (callback) {
                        createExpressApp(workerOneLogBus.createExpressHandler(), function (err, worker) {
                            workerOne = worker;
                            callback();
                        });
                    },
                    function (callback) {
                        createExpressApp(workerTwoLogBus.createExpressHandler(), function (err, worker) {
                            workerTwo = worker;
                            callback();
                        });
                    }
                ], function () { callback(); });
            },
            function (callback) {
                httpEventAggregator = new HttpEventAggregator({
                    urls: [workerOne.url, workerTwo.url],
                    subscription: { type: 'log' }
                });

                setTimeout(function () {
                    callback();
                }, 20);

            },
            function (callback) {
                var logs = [];
                httpEventAggregator.on('log', function (e) {
                    if (e.type === 'log') {
                        logs.push(e.message);
                    }
                    if (logs.length === 2) {
                        expect(logs, 'to equal', [
                            'worker 1',
                            'worker 2'
                        ]);
                        httpEventAggregator.removeAllListeners();
                        httpEventAggregator.close();
                        return callback();
                    }

                });

                workerOneLogBus.emit('log', 'worker 1');
                workerTwoLogBus.emit('log', 'worker 2');
            }
        ], done);
    });
    it('should be able to close connections', function () {
        var httpEventAggregator = new HttpEventAggregator({
            urls: [
                'http://0.0.0.0:99999',
                'http://0.0.0.0:99998'
            ],
            subscription: {
                type: 'log'
            }
        });

        expect(httpEventAggregator._connections, 'to have keys', [
            'http://0.0.0.0:99999',
            'http://0.0.0.0:99998'
        ]);

        httpEventAggregator.close();

        expect(httpEventAggregator._connections, 'to equal', {});
    });
    it('should be able to reopen connections', function (done) {
        var logBus = new LogBus();
        var httpEventAggregator = new HttpEventAggregator();

        var logs = [];

        httpEventAggregator.subscription = { type: 'log' };
        httpEventAggregator.on('log', function (e) {
            logs.push(e.message);
        });

        async.waterfall([
            function (callback) {
                    createExpressApp(logBus.createExpressHandler(), callback);
            },
            function (worker, callback) {
                httpEventAggregator.urls = [ worker.url ];
                httpEventAggregator.start(10); // append &timeout=10 to url
                setTimeout(callback, 5);
            },
            function (callback) {
                logBus.emit('log', { type: 'log', message: 'foo' });
                setTimeout(callback, 20);
            },
            function (callback) {
                expect([
                    'opening new connections',
                    'opening new connection to',
                    'got response',
                    'foo', // This is the emitted event from the previous callback
                    'connection was closed.', // the timeout was reached
                    'requesting new connection', // opening new connection
                    'opening new connection to',
                    'got response',
                    'connection was closed.',
                    'requesting new connection',
                    'opening new connection to'
                ], 'to equal', logs);
                callback();
            }
        ], done);
    });
    describe('what happens when workers misbehave...', function () {
        // The purpose of these tests is to make sure that the test
        // can continue even though the requests fails.
        var crashServerPath = require('path').resolve(__dirname, '..', '..', 'testdata', 'crashServer.js');
        var crashServer;
        var port = 0;

        beforeEach(function (done) {
            crashServer = require('child_process').fork(crashServerPath, [], { silent: true });
            crashServer.on('message', function (msg) {
                port = msg.port;
                setTimeout(done, 10);
            });
        });
        afterEach(function () {
            crashServer = null;
        });
        it('worker process.exit(1)', function (done) {
            var httpEventAggregator = new HttpEventAggregator();
            httpEventAggregator.urls = [ 'http://0.0.0.0:' + port + '/kill' ];
            httpEventAggregator.subscription = { type: 'log' };
            // httpEventAggregator.on('log', printLog('EXIT1'));

            httpEventAggregator.on('log', function (e) {
                if (e.message === 'Error: socket hang up') {
                    httpEventAggregator.close();
                    return done();
                }
            });

            httpEventAggregator.start();
        });
        it('worker throws uncaught exception', function (done) {
            var httpEventAggregator = new HttpEventAggregator();
            httpEventAggregator.urls = [ 'http://0.0.0.0:' + port + '/uncaughtexception' ];
            httpEventAggregator.subscription = { type: 'log' };
            // httpEventAggregator.on('log', printLog('UNCAUGHT'));

            httpEventAggregator.on('log', function (e) {
                if (e.message === 'Error: socket hang up') {
                    httpEventAggregator.close();
                    return done();
                }
            });

            httpEventAggregator.start();
        });
    });
});
