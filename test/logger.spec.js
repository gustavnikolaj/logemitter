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
	it('should take a namespace as the argument', function () {
		var logger = new Logger('theNamespace');
		expect(logger, 'to have property', 'namespace', 'theNamespace')
	});
	it('should emit events with namespaces', function (done) {
		var logger = new Logger('theNamespace');
		logger.on('log', function (e) {
			expect(e, 'to equal', {
				type: 'log',
				namespace: 'theNamespace',
				message: 'message'
			});
			done();
		});
		logger.log('message');
	});
	describe('sub instances', function () {
		it('should be able to create sub instances', function () {
			var parentLogger = new Logger('Parent');
			var childLogger = parentLogger.getNewLogger('Child');

			expect(childLogger, 'to have property', 'namespace', 'Parent.Child');
		});
		it('should relay events to the parent', function (done) {
			var parentLogger = new Logger('Parent');
			var childLogger = parentLogger.getNewLogger('Child');

			parentLogger.on('log', function (e) {
				expect(e, 'to equal', {
					type: 'log',
					namespace: 'Parent.Child',
					message: 'A log message'
				});
				done();
			});

			childLogger.log('A log message');
		});
	});
	describe('useable as a mixin', function () {
		it('should be able to augment a normal class with Logger capabilities', function (done) {
			function SomeClient() {
				Logger.augment(this, 'SomeClient');
			}

			SomeClient.prototype.getSome = function (thing) {
				this.log('Served some: ' + thing);
				return thing;
			};

			var someClient = new SomeClient();

			someClient.on('log', function (e) {
				expect(e, 'to equal', {
					namespace: 'SomeClient',
					type: 'log',
					message: 'Served some: foo'
				});
				done();
			});

			someClient.getSome('foo');
		});
	});
});
