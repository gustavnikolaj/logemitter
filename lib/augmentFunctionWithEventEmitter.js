var EventEmitter = require('events').EventEmitter;

module.exports = function augmentFunctionWithEventEmitter(func) {
    var originalFunc = func;
    var wrappedFunc = function () {
        return originalFunc.apply(originalFunc, arguments);
    };

    // The wrapped function will be made into an EventEmitter. Beware,
    // that it will not be an instance of EventEmitter.
    EventEmitter.call(wrappedFunc);
    wrappedFunc.emit = EventEmitter.prototype.emit;
    wrappedFunc.on = EventEmitter.prototype.on;

    // The original method will be extended to provide aliases for the
    // wrapped functions EventEmitter methods.
    // Note: We are not using bind here, because it is an expensive
    // operation compared to Function.prototype.apply.
    originalFunc.on = function () {
        return wrappedFunc.on.apply(wrappedFunc, arguments);
    };
    originalFunc.emit = function () {
        return wrappedFunc.emit.apply(wrappedFunc, arguments);
    };

    return wrappedFunc;
};
