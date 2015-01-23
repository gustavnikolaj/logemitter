var EventEmitter = require('events').EventEmitter;

function LogBus() {
    var that = this;
    this.subscriptions = Object.create(null);

    this.on('log', function (e) {
        Object.keys(that.subscriptions).forEach(function (key) {
            var subscription = that.subscriptions[key];
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

    this._nextSubscribeId = 0;
}

LogBus.prototype = Object.create(EventEmitter.prototype);

LogBus.prototype.createMatcherFromObject = function (matchingObject) {
    return function (e) {
        return Object.keys(matchingObject).every(function (key) {
            return key in e && matchingObject[key] === e[key];
        });
    };
};

LogBus.prototype.getNextSubscribeId = function () {
    this._nextSubscribeId += 1;
    return this._nextSubscribeId;
};

LogBus.prototype.subscribe = function (matchingObject, callback) {
    var subscriptionId = this.getNextSubscribeId();
    this.subscriptions[subscriptionId] = {
        matcher: this.createMatcherFromObject(matchingObject),
        callback: callback,
    };
    return subscriptionId;
};

LogBus.prototype.unsubscribe = function (subscription) {
    delete this.subscriptions[subscription];
};

module.exports = LogBus;
