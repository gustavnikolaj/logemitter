// Log levels based on the Syslog rfc 5424
// https://tools.ietf.org/html/rfc5424#section-6.2.1

var logLevel = {};

// Levels from RFC
logLevel.EMERGENCY = 0;
logLevel.ALERT = 1;
logLevel.CRITICAL = 2;
logLevel.ERROR = 3;
logLevel.WARNING = 4;
logLevel.NOTICE = 5;
logLevel.INFORMATIONAL = 6;
logLevel.DEBUG = 7;

// Convenience aliases
logLevel.INFO = 7;

module.exports = logLevel;
