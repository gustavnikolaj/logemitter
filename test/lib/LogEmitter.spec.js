/* global describe, it */
var LogEmitter = require('../../lib/LogEmitter');
var sinon = require('sinon');
var expect = require('unexpected')
    .installPlugin(require('unexpected-sinon'));
var async = require('async');

var EventEmitter = require('events').EventEmitter;

describe('lib/LogEmitter', function () {
    it('should export a function', function () {
        expect(LogEmitter, 'to be a function');
    });
    it('should be an instance of EventEmitter', function () {
        var logEmitter = new LogEmitter();
        expect(logEmitter, 'to be an', EventEmitter);
    });
    it('should emit an object when a string is passed as payload', function (done) {
        var string = 'log message';
        var logEmitter = new LogEmitter();
        logEmitter.on('log', function (e) {
            expect(e, 'to satisfy', {
                type: 'log',
                message: 'log message'
            });
            done();
        });
        logEmitter.emit('log', string);
    });
    it('should leave non log events alone', function (done) {
        async.each([
            'foo',
            'open',
            'readable',
            'connect',
            'listener',
            'data',
            'info'
        ], function (eventName, callback) {
            var logEmitter = new LogEmitter();
            logEmitter.on(eventName, function (e) {
                try {
                    expect(e, 'to equal', 'this is the ' + eventName + ' event');
                } catch (e) {
                    return callback(e);
                }
                callback();
            });
            logEmitter.emit(eventName, 'this is the ' + eventName + ' event');
        }, done);
    });
    describe('severity methods', function () {
        ['log', 'info', 'debug', 'error'].forEach(function (severity) {
            describe('.' + severity, function () {
                it('should emit an event with severity ' + severity, function (done) {
                    var logEmitter = new LogEmitter();
                    logEmitter.on('log', function (e) {
                        expect(e, 'to satisfy', {
                            severity: severity,
                            message: 'the log message'
                        });
                        done();
                    });
                    logEmitter[severity]('the log message');
                });
                it('should take multiple args', function (done) {
                    var logEmitter = new LogEmitter();
                    logEmitter.on('log', function (e) {
                        expect(e, 'to have property', 'message', 'the, log, message');
                        done();
                    });
                    logEmitter[severity]('the', 'log', 'message');
                });
                it('should take an object as arg', function (done) {
                    var logEmitter = new LogEmitter();
                    logEmitter.on('log', function (e) {
                        expect(e, 'to equal', {
                            type: 'log',
                            severity: severity,
                            message: 'the log message',
                            anotherProp: true
                        });
                        done();
                    });
                    logEmitter[severity]({ message: 'the log message', anotherProp: true });
                });
            });
        });
    });
    describe('baseLogObject', function () {
        it('should add basic properties to the emitted object', function (done) {
            var logEmitter = new LogEmitter();
            logEmitter.on('log', function (e) {
                expect(e, 'to satisfy', {
                    type: 'log',
                    message: 'a log message'
                });
                done();
            });
            logEmitter.emit('log', { message: 'a log message' });
        });
        it('should be able to extend the baseLogObject', function (done) {
            var logEmitter = new LogEmitter();
            logEmitter.on('log', function (e) {
                expect(e, 'to satisfy', {
                    message: 'a log message',
                    extraAttribute: true
                });
                done();
            });
            logEmitter.logBaseObject = {
                extraAttribute: true
            };
            logEmitter.emit('log', { message: 'a log message' });
        });
        it('should keep the defaults when adding extra attributes', function (done) {
            var logEmitter = new LogEmitter();
            logEmitter.on('log', function (e) {
                expect(e, 'to satisfy', {
                    type: 'log',
                    message: 'a log message',
                    extraAttribute: true
                });
                done();
            });
            logEmitter.logBaseObject = {
                extraAttribute: true
            };
            logEmitter.emit('log', { message: 'a log message' });
        });
    });
    describe('.augmentFunction', function () {
        it('should return a wrapped function', function () {
            expect(LogEmitter.augmentFunction(function () {}), 'to be a function');
        });
        it('should set the proper context for the augmented function', function () {
            LogEmitter.augmentFunction(function () {
                if (this === this.global) {
                    // assert that the context is NOT global
                    expect.fail('not executed in the proper context');
                }
            })();
        });
        it('should augment the function with .on and .emit methods', function () {
            LogEmitter.augmentFunction(function originalFunction() {
                expect(this, 'to satisfy', {
                    on: expect.it('to be a function'),
                    emit: expect.it('to be a function')
                });
            })();
        });
        it('should properly propagate the arguments to the original function', function () {
            LogEmitter.augmentFunction(function originalFunction() {
                var expectedArguments = (function () {
                    return arguments;
                })('first arg', 'second arg');

                expect(arguments, 'to satisfy', expectedArguments);
            })('first arg', 'second arg');
        });
        it('should return a function useable as an EventEmitter', function (done) {
            var LogBus = require('../../lib/LogBus');
            var logBus = new LogBus();
            var logSpy = sinon.spy();

            var someAsyncTask = LogEmitter.augmentFunction(function () {
                var that = this;
                that.emit('log', 'starting some async task');
                setImmediate(function () {
                    that.emit('log', 'completed some async task');
                });
            });

            require('../../lib/relayLogEvents')(logBus, someAsyncTask);

            logBus.subscribe({ type: 'log' }, logSpy);

            someAsyncTask();

            expect(someAsyncTask.on, 'to be a function');
            expect(logSpy, 'was called once');
            expect(logSpy, 'was called with', {
                type: 'log',
                severity: 'log',
                message: 'starting some async task'
            });
            setImmediate(function () {
                expect(logSpy, 'was called twice');
                expect(logSpy, 'was called with', {
                    type: 'log',
                    severity: 'log',
                    message: 'completed some async task'
                });
                done();
            });
        });
        describe('should add convenience methods', function () {
            var listenerSpy;
            beforeEach(function () {
                listenerSpy = sinon.spy();
            });
            it('.log(message)', function () {
                var augmentedFunction = LogEmitter.augmentFunction(function () {
                    this.log('hello this is a log message');
                });
                augmentedFunction.on('log', listenerSpy);
                augmentedFunction();

                expect(listenerSpy, 'was called once');
                expect(listenerSpy, 'was called with', {
                    type: 'log',
                    severity: 'log',
                    message: 'hello this is a log message'
                });
            });
            it('.info(message)', function () {
                var augmentedFunction = LogEmitter.augmentFunction(function () {
                    this.info('this is info foobar');
                });
                augmentedFunction.on('log', listenerSpy);
                augmentedFunction();

                expect(listenerSpy, 'was called once');
                expect(listenerSpy, 'was called with', {
                    type: 'log',
                    severity: 'info',
                    message: 'this is info foobar'
                });
            });
            it('.debug(message)', function () {
                var augmentedFunction = LogEmitter.augmentFunction(function () {
                    this.debug('this is debug foobar');
                });
                augmentedFunction.on('log', listenerSpy);
                augmentedFunction();

                expect(listenerSpy, 'was called once');
                expect(listenerSpy, 'was called with', {
                    type: 'log',
                    severity: 'debug',
                    message: 'this is debug foobar'
                });
            });
            it('.error(message)', function () {
                var augmentedFunction = LogEmitter.augmentFunction(function () {
                    this.error('this is error foobar');
                });
                augmentedFunction.on('log', listenerSpy);
                augmentedFunction();

                expect(listenerSpy, 'was called once');
                expect(listenerSpy, 'was called with', {
                    type: 'log',
                    severity: 'error',
                    message: 'this is error foobar'
                });
            });
        });
        describe('features from LogEmitter', function () {
            describe('baseLogObject', function () {
                it('should have the getter', function () {
                    var augmentedFunction = LogEmitter.augmentFunction(function () {});
                    expect(augmentedFunction.logBaseObject, 'to equal', {
                        type: 'log',
                        severity: 'log'
                    });
                });
                it('should add basic properties to the emitted object', function (done) {
                    var augmentedFunction = LogEmitter.augmentFunction(function () {
                        this.log('test');
                    });
                    augmentedFunction.on('log', function (e) {
                        expect(e, 'to equal', {
                            type: 'log',
                            severity: 'log',
                            message: 'test'
                        });
                        done();
                    });
                    augmentedFunction();
                });
                it('should be able to extend the baseLogObject', function (done) {
                    var augmentedFunction = LogEmitter.augmentFunction(function () {
                        this.log('test');
                    });
                    augmentedFunction.on('log', function (e) {
                        expect(e, 'to satisfy', {
                            message: 'test',
                            extraAttribute: true
                        });
                        done();
                    });
                    augmentedFunction.logBaseObject = {
                        extraAttribute: true
                    };
                    augmentedFunction();
                });
                it('should keep the defaults when adding extra attributes', function (done) {
                    var augmentedFunction = LogEmitter.augmentFunction(function () {
                        this.log('test');
                    });
                    augmentedFunction.on('log', function (e) {
                        expect(e, 'to equal', {
                            type: 'log',
                            severity: 'log',
                            message: 'test',
                            extraAttribute: true
                        });
                        done();
                    });
                    augmentedFunction.logBaseObject = {
                        extraAttribute: true
                    };
                    augmentedFunction();
                });
            });
            describe('severity methods', function () {
                ['log', 'info', 'debug', 'error'].forEach(function (severity) {
                    describe('.' + severity, function () {
                        it('should emit an event with severity ' + severity, function (done) {
                            var augmentedFunction = LogEmitter.augmentFunction(function () {
                                this[severity]('the log message');
                            });
                            augmentedFunction.on('log', function (e) {
                                expect(e, 'to satisfy', {
                                    severity: severity,
                                    message: 'the log message'
                                });
                                done();
                            });
                            augmentedFunction();
                        });
                        it('should take multiple args', function (done) {
                            var augmentedFunction = LogEmitter.augmentFunction(function () {
                                this[severity]('the', 'log', 'message');
                            });
                            augmentedFunction.on('log', function (e) {
                                expect(e, 'to have property', 'message', 'the, log, message');
                                done();
                            });
                            augmentedFunction();
                        });
                        it('should take an object as arg', function (done) {
                            var augmentedFunction = LogEmitter.augmentFunction(function () {
                                this[severity]({ message: 'the log message', anotherProp: true });
                            });
                            augmentedFunction.on('log', function (e) {
                                expect(e, 'to equal', {
                                    type: 'log',
                                    severity: severity,
                                    message: 'the log message',
                                    anotherProp: true
                                });
                                done();
                            });
                            augmentedFunction();
                        });
                    });
                });
            });
    });        
    });
});
