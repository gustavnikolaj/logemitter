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
});
