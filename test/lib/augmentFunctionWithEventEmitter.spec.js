/*global describe, it*/
var sinon = require('sinon');
var expect = require('unexpected')
    .installPlugin(require('unexpected-sinon'));
var LogBus = require('../../lib/LogBus');
var augmentFunctionWithEventEmitter = require('../../lib/augmentFunctionWithEventEmitter');
var relayEvents = require('../../lib/relayEvents');

describe('augmentFunctionWithEventEmitter', function () {
    it('should return a wrapped function', function () {
        expect(augmentFunctionWithEventEmitter(function () {}), 'to be a function');
    });
    it('should set the proper context for the augmented function', function () {
        augmentFunctionWithEventEmitter(function () {
            if (this === this.global) {
                // assert that the context is NOT global
                expect.fail('not executed in the proper context');
            }
        })();
    });
    it('should augment the function with .on and .emit methods', function () {
        augmentFunctionWithEventEmitter(function originalFunction() {
            expect(this, 'to satisfy', {
                on: expect.it('to be a function'),
                emit: expect.it('to be a function')
            });
        })();
    });
    it('should properly propagate the arguments to the original function', function () {
        augmentFunctionWithEventEmitter(function originalFunction() {
            var expectedArguments = (function () {
                return arguments;
            })('first arg', 'second arg');

            expect(arguments, 'to satisfy', expectedArguments);
        })('first arg', 'second arg');
    });
    it('should return a function useable as an EventEmitter', function (done) {
        var logBus = new LogBus();
        var logSpy = sinon.spy();

        var someAsyncTask = augmentFunctionWithEventEmitter(function () {
            var that = this;
            that.emit('log', 'starting some async task');
            setImmediate(function () {
                that.emit('log', 'completed some async task');
            });
        });

        relayEvents('log', logBus, someAsyncTask);

        logBus.subscribe({ type: 'log' }, logSpy);

        someAsyncTask();

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
    it('should allow relayEvents to overwrite the augmented emit method', function (done) {
        var logBus = new LogBus();
        var logSpy = sinon.spy();

        var method = augmentFunctionWithEventEmitter(function () {
            this.emit('foo', 'bar');
        });

        relayEvents('*', logBus, method); // Subscribing to all events will wrap emit

        logBus.subscribe({ type: 'foo' }, logSpy);

        method();

        setImmediate(function () {
            expect(logSpy, 'was called once');
            expect(logSpy, 'was called with', { type: 'foo', message: 'bar' });
            done();
        });
    });
});
