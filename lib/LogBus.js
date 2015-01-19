var EventEmitter = require('events').EventEmitter;

function LogBus() {
	this.subscriptions = [];

	this.on('log', function (e) {
		this.subscriptions.forEach(function (subscription) {
			if (subscription.matcher(e)) {
				return subscription.callback(e);
			}
		});
	})
}

LogBus.prototype = Object.create(EventEmitter.prototype);

LogBus.prototype.subscribe = function (matchingObject, callback) {
	this.subscriptions.push({
		matcher: function (e) {
			return Object.keys(matchingObject).every(function (key) {
				return key in e && matchingObject[key] === e[key];
			});
		},
		callback: callback
	});
};

module.exports = LogBus;
