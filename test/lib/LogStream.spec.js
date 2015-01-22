/*global describe, it*/
var LogStream = require('../../lib/LogStream');
var expect = require('unexpected');

describe('LogStream', function () {
    it('should be a Readable stream', function () {
        var ReadableStream = require('stream').Readable;
        var logStream = new LogStream();
        expect(logStream, 'to be a', ReadableStream);
    });
    it('should be an object mode stream', function () {
        var logStream = new LogStream();
        expect(logStream, 'to satisfy', {
            _readableState: {
                objectMode: true
            }
        });
    });
    it('should be closable from the receiving end', function (done) {
        var logStream = new LogStream();
        expect(logStream, 'to satisfy', {
            _readableState: {
                ended: false
            }
        });
        logStream.close();
        setImmediate(function () {
            expect(logStream, 'to satisfy', {
                _readableState: {
                    ended: true
                }
            });
            done();
        });
    });
});
