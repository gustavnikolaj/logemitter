var EventEmitter = require('events').EventEmitter;

function LogEmitter() {
    EventEmitter.call(this);
}

LogEmitter.prototype = Object.create(EventEmitter.prototype);

LogEmitter.prototype.log = function (message) {
    this.emit('log', {
        type: 'log',
        severity: 'log',
        message: message
    });
};

LogEmitter.prototype.info = function (message) {
    this.emit('log', {
        type: 'log',
        severity: 'info',
        message: message
    });
};

LogEmitter.prototype.debug = function (message) {
    this.emit('log', {
        type: 'log',
        severity: 'debug',
        message: message
    });
};

LogEmitter.prototype.error = function (message) {
    this.emit('log', {
        type: 'log',
        severity: 'debug',
        message: message
    });
};

module.exports = LogEmitter;
