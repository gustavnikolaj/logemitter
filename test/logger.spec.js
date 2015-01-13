var expect = require('unexpected');
var Logger = require('../');

describe('logger', function () {
	it('should be an EventEmitter', function () {
		expect(new Logger(), 'to be an', require('events').EventEmitter);
	});
	it('should be able to subscribe to an event', function (done) {
		var logger = new Logger();
		logger.on('someEvent', function (e) {
			expect(e, 'to equal', 'someThing');
			done();
		});
		logger.emit('someEvent', 'someThing');
	});
	it('should have a method called log that emits log events', function (done) {
		var logger = new Logger();
		logger.on('log', function (e) {
			expect(e, 'to equal', {
				type: 'log',
				message: 'logMessage'
			});
			done();
		});
		logger.log('logMessage')
	});
});