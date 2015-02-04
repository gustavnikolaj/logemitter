var EventEmitter = require('events').EventEmitter;
var request = require('request');
var qs = require('qs');
var byline = require('byline');

function HttpEventAggregator(options) {
    EventEmitter.call(this);

    options = options || {};

    this.subscription = options.subscription || {};
    this.urls = options.urls || [];

    this._connections = {};

    if (this.urls.length > 0) {
        this.start();
    }
}

HttpEventAggregator.prototype = Object.create(EventEmitter.prototype);

HttpEventAggregator.prototype.start = function (timeout) {
    this.timeout = timeout;
    this.emit('log', {
        type: 'debug',
        message: 'opening new connections',
    });
    this.urls.forEach(this.subscribe.bind(this));
};

HttpEventAggregator.prototype.close = function (url) {
    this.urls.forEach(this.unsubscribe.bind(this));
};

HttpEventAggregator.prototype.subscribe = function (url) {
    var that = this;
    this.emit('log', {
        type: 'debug',
        message: 'opening new connection to',
        host: url
    });
    var timeout = this.timeout ? '&timeout=' + this.timeout : '';
    var req = request(url + '?' + qs.stringify(that.subscription) + timeout);
    that._connections[url] = req;

    req.on('response', function () {
        that.emit('log', { type: 'debug', message: 'got response', url: url });
    });

    req._readableState = {encoding: 'utf8'};
    var lines = byline.createStream(req);

    lines.on('data', function (line) {
        that.emit('log', JSON.parse(line));
    });

    var onEndCloseError = function () {
        that.emit('log', {
            type: 'warn',
            message: 'connection was closed.',
            host: url
        });
        // If the connection was closed and still in the _connections
        // collection, it was closed due to a failure and not
        // intended.
        if (that._connections[url]) {
            req.removeAllListeners();
            delete that._connections[url];
            that.emit('log', {
                type: 'debug',
                message: 'requesting new connection',
                host: url
            });
            return that.subscribe(url);
        }
    };

    req.on('end', onEndCloseError);
    req.on('close', onEndCloseError);
    req.on('error', onEndCloseError);

    req.on('error', function (err) {
        that.emit('log', { type: 'debug', message: err.toString(), onError: true });
    });
};

HttpEventAggregator.prototype.unsubscribe = function (url) {
    this.emit('log', {
        type: 'debug',
        message: 'removing existing connection to host, if any.',
        host: url
    });
    var req = this._connections[url];
    if (req) {
        req.abort();
        delete this._connections[url];
    }
};

module.exports = HttpEventAggregator;
