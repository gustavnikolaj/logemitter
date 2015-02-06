var LogBus = require('./lib/LogBus');

LogBus.relayEvents = require('./lib/relayEvents');
LogBus.augmentFunctionWithEventEmitter = require('./lib/augmentFunctionWithEventEmitter');
LogBus.LogEmitter = require('./lib/LogEmitter');
LogBus.HttpEventAggregator = require('./lib/HttpEventAggregator');

module.exports = LogBus;
