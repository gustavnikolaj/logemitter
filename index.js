var EventEmitter = require('events').EventEmitter;

function Logger(namespace) {
	this.namespace = namespace;
}

Logger.augment = function (object, namespace) {
	object._logger = new Logger(namespace);
	object.log = Logger.prototype.log.bind(object._logger);
	object.on = Logger.prototype.on.bind(object._logger);
};

Logger.prototype = Object.create(EventEmitter.prototype);

Logger.prototype.log = function (message) {
	return this.emit('log', {
		type: 'log',
		namespace: this.namespace,
		message: message
	})
};

Logger.prototype.getNewLogger = function (namespace) {
	var child = new Logger(this.namespace + '.' + namespace);
	var originalChildEmit = child.emit;
	var that = this;

	child.emit = function () {
		that.emit.apply(that, arguments);
		return originalChildEmit.apply(this, arguments);
	};

	return child;
};

module.exports = Logger;
