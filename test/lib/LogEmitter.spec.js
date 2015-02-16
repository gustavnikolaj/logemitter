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
    describe('severity methods', function () {
        ['log', 'info', 'debug', 'error'].forEach(function (severity) {
            it('.' + severity, function (done) {
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
});
