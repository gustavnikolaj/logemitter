var EventEmitter = require('events').EventEmitter;

function relayEvents(event, destination, source) {
    source.on(event, function (e) {
        destination.emit(event, e);
    });
}


module.exports = {
    relayEvents: relayEvents
};
