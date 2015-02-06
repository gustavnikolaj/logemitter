var LogBus = require('./lib/LogBus');

LogBus.relayEvents = require('./lib/relayEvents');
LogBus.augmentFunctionWithEventEmitter = require('./lib/augmentFunctionWithEventEmitter');
LogBus.augmentObject = require('./lib/augmentObject');
LogBus.LogEmitter = require('./lib/LogEmitter');
LogBus.HttpEventAggregator = require('./lib/HttpEventAggregator');

module.exports = LogBus;
