var EventEmitter = require('events').EventEmitter;
var LogStream = require('./LogStream');

function LogBus() {
    this.subscriptions = [];

    this.on('log', function (e) {
        this.subscriptions.forEach(function (subscription) {
            if (subscription.matcher(e)) {
                if (subscription.callback) {
                    return subscription.callback(e);
                }

                subscription.stream.push(e);
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

LogBus.prototype.stream = function (matchingObject) {
    var subscription = {
        matcher: this.createMatcherFromObject(matchingObject),
        stream: new LogStream()
    };

    this.subscriptions.push(subscription);

    var that = this;
    subscription.stream.on('close', function () {
        var index = that.subscriptions.indexOf(subscription);
        that.subscriptions.splice(index, 1);
    });

    return subscription.stream;
};

module.exports = LogBus;
