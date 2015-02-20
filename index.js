var LogBus = require('./lib/LogBus');

LogBus.relayLogEvents = require('./lib/relayLogEvents');
LogBus.augmentFunctionWithEventEmitter = require('./lib/augmentFunctionWithEventEmitter');
LogBus.LogEmitter = require('./lib/LogEmitter');
LogBus.HttpEventAggregator = require('./lib/HttpEventAggregator');

module.exports = LogBus;
