/*global describe, it*/
var sinon = require('sinon');
var expect = require('unexpected')
    .installPlugin(require('unexpected-sinon'));
var LogBus = require('../lib/LogBus');
var EventEmitter = require('events').EventEmitter;
var relayEvents = require('../lib/relayEvents');

function turnFunctionIntoEventEmitterFunction(func) {
    var newFunc = func;

    EventEmitter.call(newFunc);
    newFunc.emit = EventEmitter.prototype.emit;
    newFunc.on = EventEmitter.prototype.on;

    var wrappedFunc = function () {
        return newFunc.apply(newFunc, arguments);
    };

    wrappedFunc.on = newFunc.on.bind(newFunc);
    wrappedFunc.emit = newFunc.emit.bind(newFunc);

    return wrappedFunc;
}


describe('Example', function () {
    it('A basic usecase', function (done) {
        var logBus = new LogBus();
        var logSpy = sinon.spy();

        // function someAsyncTask() {
        //     if (this === this.global) { expect.fail('someAsyncTask is not executed in the proper context'); }
        //     expect(this, 'to have properties', ['emit', 'on']);

        //     var that = this;

        //     that.emit('log', 'starting some async task');
        //     setImmediate(function () {
        //         that.emit('log', 'completed some async task');
        //     });
        // }

        // EventEmitter.call(someAsyncTask);
        // someAsyncTask.emit = EventEmitter.prototype.emit;
        // someAsyncTask.on = EventEmitter.prototype.on;

        var someAsyncTask = turnFunctionIntoEventEmitterFunction(function () {
            if (this === this.global) { expect.fail('someAsyncTask is not executed in the proper context'); }
            expect(this, 'to have properties', ['emit', 'on']);
            expect(arguments, 'to satisfy', ['foo', 'bar']);

            var that = this;

            that.emit('log', 'starting some async task');
            setImmediate(function () {
                that.emit('log', 'completed some async task');
            });
        });

        relayEvents('log', logBus, someAsyncTask);

        logBus.subscribe({ type: 'log' }, logSpy);

        // someAsyncTask.call(someAsyncTask);
        // someAsyncTask.bind(someAsyncTask)();
        someAsyncTask('foo', 'bar');

        expect(someAsyncTask.on, 'to be a function');
        expect(logSpy, 'was called once');
        expect(logSpy, 'was called with', {
            type: 'log',
            message: 'starting some async task'
        });
        setImmediate(function () {
            expect(logSpy, 'was called twice');
            expect(logSpy, 'was called with', {
                type: 'log',
                message: 'completed some async task'
            });
            done();
        });
    });
});
