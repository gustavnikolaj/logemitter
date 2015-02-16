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
            var base = extend({}, this.logBaseObject);
            result = extend(base, payload);
        }
        originalEmit(event, result);
    }.bind(this);
}

LogEmitter.prototype = Object.create(EventEmitter.prototype);

LogEmitter.prototype.log = function (message) {
    this.emit('log', {
        severity: 'log',
        message: message
    });
};

LogEmitter.prototype.info = function (message) {
    this.emit('log', {
        severity: 'info',
        message: message
    });
};

LogEmitter.prototype.debug = function (message) {
    this.emit('log', {
        severity: 'debug',
        message: message
    });
};

LogEmitter.prototype.error = function (message) {
    this.emit('log', {
        severity: 'error',
        message: message
    });
};

module.exports = LogEmitter;
