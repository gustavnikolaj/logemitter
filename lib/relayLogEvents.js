module.exports = function relayLogEvents(destination, source) {
    source.on('log', function (e) {
        destination.emit('log', e);
    });
};
