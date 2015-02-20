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

LogEmitter.prototype = Object.create(EventEmitter.prototype);

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

LogEmitter.augmentFunction = function augmentFunctionWithLogEmitter(func) {
    var wrappedFunc = function () {
        return func.apply(func, arguments);
    };
    var logEmitter = new LogEmitter();

    Object.keys(logEmitter).forEach(function (key) {
        var descriptor = Object.getOwnPropertyDescriptor(logEmitter, key);
        if (descriptor.get && descriptor.set) {
            descriptor.get = descriptor.get.bind(logEmitter);
            descriptor.set = descriptor.set.bind(logEmitter);
        }

        Object.defineProperty(wrappedFunc, key, descriptor);
        Object.defineProperty(func, key, descriptor);
    });

    ['on'].concat(Object.keys(LogEmitter.prototype)).forEach(function (method) {
        var proxyMethod = function () {
            return logEmitter[method].apply(logEmitter, arguments);
        };
        wrappedFunc[method] = proxyMethod;
        func[method] = proxyMethod;
    });

    return wrappedFunc;
};

module.exports = LogEmitter;
