var EventEmitter = require('events').EventEmitter;

module.exports = function augmentFunctionWithEventEmitter(func) {
    var augmentedFunc = func;

    EventEmitter.call(augmentedFunc);
    augmentedFunc.emit = EventEmitter.prototype.emit;
    augmentedFunc.on = EventEmitter.prototype.on;

    var wrappedFunc = function () {
        return augmentedFunc.apply(augmentedFunc, arguments);
    };

    wrappedFunc.on = augmentedFunc.on.bind(augmentedFunc);
    wrappedFunc.emit = augmentedFunc.emit.bind(augmentedFunc);

    return wrappedFunc;
};
