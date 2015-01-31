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
    it('should have convinient aliases', function () {
        expect(logLevel, 'to have property', 'INFO', 7);
    });
});
