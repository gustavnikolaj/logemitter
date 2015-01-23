/*global describe, it, beforeEach*/
var augment = require('../../lib/augmentObject');
var sinon = require('sinon');
var expect = require('unexpected')
    .installPlugin(require('unexpected-sinon'));
var EventEmitter = require('events').EventEmitter;

function MockObject() {
    EventEmitter.call(this);
}

MockObject.prototype = Object.create(EventEmitter.prototype);

augment(MockObject.prototype);

describe('augmentObject', function () {
    describe('should add convenience methods', function () {
        var mockObject;
        var listenerSpy;
        beforeEach(function () {
            mockObject = new MockObject();
            listenerSpy = sinon.spy();

            mockObject.on('log', listenerSpy);
        });
        it('.log(message)', function () {
            mockObject.log('hello this is a log message');

            expect(listenerSpy, 'was called once');
            expect(listenerSpy, 'was called with', {
                type: 'log',
                severity: 'log',
                message: 'hello this is a log message'
            });
        });
        it('.info(message)', function () {
            mockObject.info('this is info foobar');

            expect(listenerSpy, 'was called once');
            expect(listenerSpy, 'was called with', {
                type: 'log',
                severity: 'info',
                message: 'this is info foobar'
            });
        });
        it('.debug(message)', function () {
            mockObject.debug('this is debug foobar');

            expect(listenerSpy, 'was called once');
            expect(listenerSpy, 'was called with', {
                type: 'log',
                severity: 'debug',
                message: 'this is debug foobar'
            });
        });
        it('.error(message)', function () {
            mockObject.error('this is error foobar');

            expect(listenerSpy, 'was called once');
            expect(listenerSpy, 'was called with', {
                type: 'log',
                severity: 'error',
                message: 'this is error foobar'
            });
        });
    });
});
