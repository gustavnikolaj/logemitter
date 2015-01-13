var EventEmitter = require('events').EventEmitter;

function Logger(namespace) {
	this.namespace = namespace;
}

Logger.prototype = Object.create(EventEmitter.prototype);

Logger.prototype.log = function (message) {
	return this.emit('log', {
		type: 'log',
		namespace: this.namespace,
		message: message
	})
};

module.exports = Logger;