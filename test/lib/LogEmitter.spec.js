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
    });
});
