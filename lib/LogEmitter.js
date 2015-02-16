var EventEmitter = require('events').EventEmitter;
var extend = require('util-extend');

var defaultLogBaseObject = {
    type: 'log',
    severity: 'log'
};

function LogEmitter() {
    EventEmitter.call(this);
    var logBaseObject = defaultLogBaseObject;
    Object.defineProperty(this, 'logBaseObject', {
        get: function () {
            return logBaseObject;
        },
        set: function (value) {
            var base = extend({}, defaultLogBaseObject);
            logBaseObject = extend(base, value);
        }
    });

    var originalEmit = this.emit.bind(this);
    this.emit = function (event, payload) {
        var result = payload;
        if (event === 'log') {
            if (typeof payload === 'string') {
                payload = { message: payload };
            }

            var base = extend({}, this.logBaseObject);
            result = extend(base, payload);
        }
        originalEmit(event, result);
    }.bind(this);
}

LogEmitter.prototype = Object.create(EventEmitter.prototype);

LogEmitter.prototype.log = function () {
    this.emit('log', {
        severity: 'log',
        message: Array.prototype.slice.call(arguments).join(', ')
    });
};

LogEmitter.prototype.info = function () {
    this.emit('log', {
        severity: 'info',
        message: Array.prototype.slice.call(arguments).join(', ')
    });
};

LogEmitter.prototype.debug = function () {
    this.emit('log', {
        severity: 'debug',
        message: Array.prototype.slice.call(arguments).join(', ')
    });
};

LogEmitter.prototype.error = function () {
    this.emit('log', {
        severity: 'error',
        message: Array.prototype.slice.call(arguments).join(', ')
    });
};

module.exports = LogEmitter;
