var EventEmitter = require('events').EventEmitter;

function LogBus() {
    this.subscriptions = [];

    this.on('log', function (e) {
        this.subscriptions.forEach(function (subscription) {
            if (subscription.matcher(e)) {
                return subscription.callback(e);
            }
        });
    });

    var originalEmit = this.emit.bind(this);
    this.emit = function (type, event) {
        if (typeof event !== 'object') {
            event = { message: event };
        }

        if (!event.type) {
            event.type = type;
        }

        originalEmit('log', event);
    };
}

LogBus.prototype = Object.create(EventEmitter.prototype);

LogBus.prototype.createMatcherFromObject = function (matchingObject) {
    return function (e) {
        return Object.keys(matchingObject).every(function (key) {
            return key in e && matchingObject[key] === e[key];
        });
    };
};

LogBus.prototype.subscribe = function (matchingObject, callback) {
    this.subscriptions.push({
        matcher: this.createMatcherFromObject(matchingObject),
        callback: callback
    });
};

module.exports = LogBus;
