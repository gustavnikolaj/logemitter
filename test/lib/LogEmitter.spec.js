/* global describe, it */
var LogEmitter = require('../../lib/LogEmitter');
var expect = require('unexpected');

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
    describe('non log events', function () {
        [
            'foo',
            'open',
            'readable',
            'connect',
            'listener',
            'data',
            'info'
        ].forEach(function (eventName) {
            it('should not mess with "' + eventName + '" events', function () {
                var logEmitter = new LogEmitter();
                logEmitter.on(eventName, function (e) {
                    expect(e, 'to equal', 'this is the ' + eventName + ' event');
                });
                logEmitter.emit(eventName, 'this is the ' + eventName + ' event');
            });
        });
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
        it('should allow a user to overwrite defaults from the logBaseObject', function () {
            var logEmitter = new LogEmitter();
            logEmitter.on('log', function (e) {
                expect(e, 'to satisfy', {
                    type: 'not a log',
                    message: 'a log message',
                    extraAttribute: 'bar'
                });
            });
            logEmitter.logBaseObject = {
                extraAttribute: 'foo'
            };
            logEmitter.emit('log', { type: 'not a log', message: 'a log message', extraAttribute: 'bar' });
        });
    });
    describe('.relay', function () {
        it('relaying events from one emitter to another', function (done) {
            var logEmitterOne = new LogEmitter();
            var logEmitterTwo = new LogEmitter();

            logEmitterOne.relay(logEmitterTwo);

            logEmitterTwo.on('log', function (e) {
                expect(e, 'to have property', 'message', 'hey there!');
                done();
            });

            logEmitterOne.log('hey there!');
        });
        it('should be able to relay methods from augmented functions', function (done) {
            var func = LogEmitter.augmentFunction(function () {
                this.log('I was called');
            });
            var logEmitter = new LogEmitter();
            func.relay(logEmitter);

            logEmitter.on('log', function (e) {
                expect(e, 'to equal', {
                    severity: 'log',
                    type: 'log',
                    message: 'I was called'
                });
                done();
            });

            func();
        });
    });
    describe('.augmentFunction', function () {
        it('should be able to augment a function with LogEmitter behaviour', function (done) {
            var func = LogEmitter.augmentFunction(function (arg) {
                this.log({ message: 'was called', value: arg });
            });

            func.on('log', function (e) {
                expect(e, 'to equal', {
                    severity: 'log',
                    type: 'log',
                    message: 'was called',
                    value: 'foobar'
                });
                done();
            });

            func('foobar');
        });
        it('should be able to set the logBaseObject', function (done) {
            var func = LogEmitter.augmentFunction(function (arg) {
                this.logBaseObject = {
                    iAm: 'augmented'
                };
                this.log({ message: 'was called', value: arg });
            });

            func.on('log', function (e) {
                expect(e, 'to equal', {
                    iAm: 'augmented',
                    severity: 'log',
                    type: 'log',
                    message: 'was called',
                    value: 'foobar'
                });
                done();
            });

            func('foobar');
        });
        it('should be able to relay methods from other logemitters', function (done) {
            var func = LogEmitter.augmentFunction(function () {
                this.logBaseObject = {
                    iAmAugmented: true
                };
            });
            var logEmitter = new LogEmitter();
            logEmitter.relay(func);

            func.on('log', function (e) {
                expect(e, 'to equal', {
                    iAmAugmented: true,
                    severity: 'log',
                    type: 'log',
                    message: 'logged from logEmitter'
                });
                done();
            });

            func();
            logEmitter.log('logged from logEmitter');
        });
    });
    describe('.report', function () {
        it('should report log lines to the given destination', function () {
            var latestLogMessage = null;
            var reporter = {
                log: function (x) { latestLogMessage = x; }
            };
            var logEmitter = new LogEmitter();
            logEmitter.report(reporter);
            logEmitter.log('foobar');
            expect(latestLogMessage, 'to equal', 'foobar');
        });
        it('should return a method to stop reporting', function () {
            var latestLogMessage = null;
            var reporter = {
                log: function (x) { latestLogMessage = x; }
            };
            var logEmitter = new LogEmitter();
            var stopReporting = logEmitter.report(reporter);
            logEmitter.log('foobar');
            expect(latestLogMessage, 'to equal', 'foobar');
            stopReporting();
            logEmitter.log('qux!');
            expect(latestLogMessage, 'to equal', 'foobar');
        });
        describe('supported reporting severities', function () {
            ['log', 'info', 'warn', 'error'].forEach(function (severity) {
                it('severity "' + severity + '" should correspond to method .' + severity + ' on the reporter', function () {
                    var latestLogMessage = null;
                    var reporter = {};
                    reporter[severity] = function (x) { latestLogMessage = x; };
                    var logEmitter = new LogEmitter();
                    logEmitter.report(reporter);
                    logEmitter.emit('log', {
                        severity: severity,
                        message: 'foobar'
                    });
                    expect(latestLogMessage, 'not to be null');
                });
            });
            it('severity "warning" should correspond to the .warn method on the reporter', function () {
                var latestLogMessage = null;
                var reporter = {};
                reporter.warn = function (x) { latestLogMessage = x; };
                var logEmitter = new LogEmitter();
                logEmitter.report(reporter);
                logEmitter.emit('log', {
                    severity: 'warning',
                    message: 'foobar'
                });
                expect(latestLogMessage, 'not to be null');
            });
            it('severity "foobar" should correspond to the .info method on the reporter', function () {
                var latestLogMessage = null;
                var reporter = {};
                reporter.info = function (x) { latestLogMessage = x; };
                var logEmitter = new LogEmitter();
                logEmitter.report(reporter);
                logEmitter.emit('log', {
                    severity: 'foobar',
                    message: 'foobar'
                });
                expect(latestLogMessage, 'not to be null');
            });
        });
        describe('reporting properties', function () {
            [
                {
                    input: {
                        message: 'foo bar',
                        prop: true
                    },
                    expected: 'foo bar prop: true'
                },
                {
                    input: {
                        message: 'A pretty error message.',
                        handler: 'test',
                        method: 'GET'
                    },
                    expected: 'A pretty error message. method: GET, handler: test'
                }
            ].forEach(function (testCase) {
                it(testCase.expected, function () {
                    var latestLogMessage = null;
                    var reporter = {
                        log: function (x) { latestLogMessage = x; }
                    };
                    var logEmitter = new LogEmitter();
                    logEmitter.report(reporter);
                    logEmitter.log(testCase.input);
                    expect(latestLogMessage, 'to equal', testCase.expected);
                });
            });
        });
    });
});
