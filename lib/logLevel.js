// Log levels based on the Syslog rfc 5424
// https://tools.ietf.org/html/rfc5424#section-6.2.1

var severity = {};
severity.EMERGENCY = 0;
severity.ALERT = 1;
severity.CRITICAL = 2;
severity.ERROR = 3;
severity.WARNING = 4;
severity.NOTICE = 5;
severity.INFORMATIONAL = 6;
severity.DEBUG = 7;

var extend = require('util-extend');

var logLevel = extend({}, severity);

logLevel.fromString = function (str) {
	if (str.toLowerCase() === 'info') {
		str = 'INFORMATIONAL';
	}
	if (severity.hasOwnProperty(str.toUpperCase())) {
		return severity[str.toUpperCase()];
	}
};

module.exports = logLevel;
