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

LogEmitter.prototype.relay = function (dest) {
    var source = this;

    source.on('log', function (e) {
        dest.emit('log', e);
    });

    return this;
};

LogEmitter.prototype.report = function (dest) {
    var source = this;
    dest = dest || console;

    var logHandler = function (e) {
        var obj = extend({}, e);
        delete obj.type;
        var severity = obj.severity;
        delete obj.severity;
        var message = obj.message;
        delete obj.message;
        message = [message].concat(Object.keys(obj).map(function (key) {
            var value = typeof obj[key] === 'string' ? obj[key] : JSON.stringify(obj[key]);
            return key + ': ' + value;
        }).join(', ')).join(' ').trim();
        if (['log', 'info', 'warn', 'error'].indexOf(severity) !== -1) {
            dest[severity](message);
        } else if (severity === 'warning') {
            dest.warn(message);
        } else {
            dest.info(message);
        }
    };

    source.on('log', logHandler);

    return function stopReportingToConsole() {
        source.removeListener('log', logHandler);
    };
};

LogEmitter.augmentFunction = function augmentFunction(func) {
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
