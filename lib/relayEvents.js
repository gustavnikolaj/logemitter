function relayEvents(eventLabel, destination, source) {
    if (typeof eventLabel === 'string') {
        if (eventLabel === '*') {
            var sourceEmit = source.emit;
            source.emit = function (eventName, eventInfo) {
                destination.emit(eventName, eventInfo);
                return sourceEmit(eventName, eventInfo);
            };
        } else {
            source.on(eventLabel, function (e) {
                destination.emit(eventLabel, e);
            });
        }
    } else if (eventLabel instanceof RegExp) {
        var sourceEmit = source.emit;
        source.emit = function (eventName, eventInfo) {
            if (eventLabel.test(eventName)) {
                destination.emit(eventName, eventInfo);
            }
            return sourceEmit(eventName, eventInfo);
        };
    }
}


module.exports = relayEvents;