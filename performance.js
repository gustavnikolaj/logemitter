var iterationCount = 10000000;

console.log('Performance testing .bind, .apply and .call.');
console.log('100,000,000 iterations each.');
console.log('');

var context = { foo: 'bar' };
var originalFunction = function (arg) { return this[arg]; };

(function () {
    var directFunction = function (arg) { return context[arg]; };
    if (directFunction('foo') !== 'bar') { new Error(); }
    var startTime = Date.now();
    var iterations = 0;
    while (iterations < iterationCount) {
        directFunction('foo');
        iterations += 1;
    }
    var endTime = Date.now();

    return console.log('Function called directly:', (endTime - startTime) + 'ms elapsed');
})();


(function () {
    var boundFunction = originalFunction.bind(context);
    if (boundFunction('foo') !== 'bar') { new Error(); }
    var startTime = Date.now();
    var iterations = 0;
    while (iterations < iterationCount) {
        boundFunction('foo');
        iterations += 1;
    }
    var endTime = Date.now();

    return console.log('Function.prototype.bind:', (endTime - startTime) + 'ms elapsed');
})();

(function () {
    var appliedFunction = function () {
        return originalFunction.apply(context, arguments);
    };
    if (appliedFunction('foo') !== 'bar') { new Error(); }
    var startTime = Date.now();
    var iterations = 0;
    while (iterations < iterationCount) {
        appliedFunction('foo');
        iterations += 1;
    }
    var endTime = Date.now();

    return console.log('Function.prototype.apply:', (endTime - startTime) + 'ms elapsed');
})();

(function () {
    var calledFunction = function (arg) {
        return originalFunction.call(context, arg);
    };
    if (calledFunction('foo') !== 'bar') { new Error(); }
    var startTime = Date.now();
    var iterations = 0;
    while (iterations < iterationCount) {
        calledFunction('foo');
        iterations += 1;
    }
    var endTime = Date.now();

    return console.log('Function.prototype.call:', (endTime - startTime) + 'ms elapsed');
})();
