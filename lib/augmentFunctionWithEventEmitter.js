var EventEmitter = require('events').EventEmitter;

module.exports = function augmentFunctionWithEventEmitter(func) {
    // First we augment the function with the necessary methods from
    // EventEmitter. Be aware that the function wont be an instance of
    // EventEmitter even though it will act like one.
    var augmentedFunc = func;

    EventEmitter.call(augmentedFunc);
    augmentedFunc.emit = EventEmitter.prototype.emit;
    augmentedFunc.on = EventEmitter.prototype.on;

    // In order to give the augmented function the correct context for
    // this, it needs to be applied on it self. This is done in the
    // wrapped method below, which is what will be returned from this
    // method.
    var wrappedFunc = function () {
        return augmentedFunc.apply(augmentedFunc, arguments);
    };

    // The on and emit methods on the wrappedFunction should be the
    // same as those on the augmented function that is returned from
    // the wrapped method.
    wrappedFunc.on = augmentedFunc.on.bind(augmentedFunc);
    wrappedFunc.emit = augmentedFunc.emit.bind(augmentedFunc);

    return wrappedFunc;
};
