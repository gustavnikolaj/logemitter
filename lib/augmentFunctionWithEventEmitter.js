var LogEmitter = require('./LogEmitter');

module.exports = function augmentFunctionWithEventEmitter(func) {
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
