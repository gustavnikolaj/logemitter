var LogEmitter = require('./LogEmitter');

module.exports = function (func) {
    console.warn('DEPRECATED! replace your use of augmentFunctionWithEventEmitter with LogEmitter.augmentFunction.');
    return LogEmitter.augmentFunction(func);
};
