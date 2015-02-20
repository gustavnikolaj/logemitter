var expect = require('unexpected');
var logLevel = require('../../lib/logLevel');

describe('lib/loglevel', function () {
    it('should export an object with loglevels', function () {
        // See: https://tools.ietf.org/html/rfc5424#section-6.2.1
        expect(logLevel, 'to have properties', {
            EMERGENCY: 0,
            ALERT: 1,
            CRITICAL: 2,
            ERROR: 3,
            WARNING: 4,
            NOTICE: 5,
            INFORMATIONAL: 6,
            DEBUG: 7
        });
    });
    it('should be able to return a severity level from a string', function () {
        expect(logLevel.fromString('notice'), 'to be', 5);
    });
    describe('.fromString(...)', function () {
        [
            ['EMERGENCY', 0],
            ['emergency', 0],
            ['ALERT', 1],
            ['alert', 1],
            ['CRITICAL', 2],
            ['critical', 2],
            ['ERROR', 3],
            ['error', 3],
            ['WARNING', 4],
            ['warning', 4],
            ['NOTICE', 5],
            ['notice', 5],
            ['INFORMATIONAL', 6],
            ['informational', 6],
            ['INFO', 6],
            ['info', 6],
            ['DEBUG', 7],
            ['debug', 7],
        ].forEach(function (test) {
            var testString = test[0];
            var testNumber = test[1];
            it(testString + ' => ' + testNumber, function () {
                expect(logLevel.fromString(testString), 'to be', testNumber);
            });
        });
    });
});
