var EventEmitter = require('events').EventEmitter;

function Logger() {

}

Logger.prototype = Object.create(EventEmitter.prototype);

Logger.prototype.log = function (message) {
	return this.emit('log', {
		type: 'log',
		message: message
	})
};

module.exports = Logger;