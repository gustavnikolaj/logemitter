var EventEmitter = require('events').EventEmitter;

function relayEvents(event, destination, source) {
    if (typeof event === 'string') {
        source.on(event, function (e) {
            destination.emit(event, e);
        });
    } else if (event instanceof RegExp) {
        var sourceEmit = source.emit;
        source.emit = function (eventName, eventInfo) {
            if (event.test(eventName)) {
                destination.emit(eventName, eventInfo);
            }
            return sourceEmit(eventName, eventInfo);
        };
    }
}


module.exports = {
    relayEvents: relayEvents
};
