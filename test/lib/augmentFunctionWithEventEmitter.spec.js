/*global describe, it, beforeEach*/
var sinon = require('sinon');
var expect = require('unexpected')
    .installPlugin(require('unexpected-sinon'));
var LogBus = require('../../lib/LogBus');
var augmentFunctionWithEventEmitter = require('../../lib/augmentFunctionWithEventEmitter');
var relayLogEvents = require('../../lib/relayLogEvents');

describe('augmentFunctionWithEventEmitter', function () {
    it('should return a wrapped function', function () {
        expect(augmentFunctionWithEventEmitter(function () {}), 'to be a function');
    });
    it('should set the proper context for the augmented function', function () {
        augmentFunctionWithEventEmitter(function () {
            if (this === this.global) {
                // assert that the context is NOT global
                expect.fail('not executed in the proper context');
            }
        })();
    });
    it('should augment the function with .on and .emit methods', function () {
        augmentFunctionWithEventEmitter(function originalFunction() {
            expect(this, 'to satisfy', {
                on: expect.it('to be a function'),
                emit: expect.it('to be a function')
            });
        })();
    });
    it('should properly propagate the arguments to the original function', function () {
        augmentFunctionWithEventEmitter(function originalFunction() {
            var expectedArguments = (function () {
                return arguments;
            })('first arg', 'second arg');

            expect(arguments, 'to satisfy', expectedArguments);
        })('first arg', 'second arg');
    });
    it('should return a function useable as an EventEmitter', function (done) {
        var logBus = new LogBus();
        var logSpy = sinon.spy();

        var someAsyncTask = augmentFunctionWithEventEmitter(function () {
            var that = this;
            that.emit('log', 'starting some async task');
            setImmediate(function () {
                that.emit('log', 'completed some async task');
            });
        });

        relayLogEvents('log', logBus, someAsyncTask);

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
            var augmentedFunction = augmentFunctionWithEventEmitter(function () {
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
            var augmentedFunction = augmentFunctionWithEventEmitter(function () {
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
            var augmentedFunction = augmentFunctionWithEventEmitter(function () {
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
            var augmentedFunction = augmentFunctionWithEventEmitter(function () {
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
                var augmentedFunction = augmentFunctionWithEventEmitter(function () {});
                expect(augmentedFunction.logBaseObject, 'to equal', {
                    type: 'log',
                    severity: 'log'
                });
            });
            it('should add basic properties to the emitted object', function (done) {
                var augmentedFunction = augmentFunctionWithEventEmitter(function () {
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
                var augmentedFunction = augmentFunctionWithEventEmitter(function () {
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
                var augmentedFunction = augmentFunctionWithEventEmitter(function () {
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
                        var augmentedFunction = augmentFunctionWithEventEmitter(function () {
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
                        var augmentedFunction = augmentFunctionWithEventEmitter(function () {
                            this[severity]('the', 'log', 'message');
                        });
                        augmentedFunction.on('log', function (e) {
                            expect(e, 'to have property', 'message', 'the, log, message');
                            done();
                        });
                        augmentedFunction();
                    });
                    it('should take an object as arg', function (done) {
                        var augmentedFunction = augmentFunctionWithEventEmitter(function () {
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
