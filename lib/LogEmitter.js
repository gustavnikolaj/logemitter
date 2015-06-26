var EventEmitter = require('events').EventEmitter;
var util = require('util');
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
        },
        enumerable: true
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

util.inherits(LogEmitter, EventEmitter);

['log', 'info', 'debug', 'error'].forEach(function (key) {
    LogEmitter.prototype[key] = function (arg1) {
        if (arguments.length === 1 && arg1 && typeof arg1 === 'object') {
            this.emit('log', extend({ severity: key }, arg1));
        } else {
            this.emit('log', {
                severity: key,
                message: Array.prototype.slice.call(arguments).join(', ')
            });
        }
    };
});

module.exports = LogEmitter;
