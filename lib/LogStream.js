var ReadableStream = require('stream').Readable;
var util = require('util');

function LogStream(options) {
	ReadableStream.call(this, options);
	this._readableState.objectMode = true;
	this.emit('readable');
}

util.inherits(LogStream, ReadableStream);

LogStream.prototype._read = function () {
};

LogStream.prototype.close = function () {
	this.push(null);
	this.emit('close');
};

module.exports = LogStream;
