module.exports = function (obj) {
    obj.log = function (message) {
        this.emit('log', {
            type: 'log',
            severity: 'log',
            message: message
        });
    };
    obj.info = function (message) {
        this.emit('log', {
            type: 'log',
            severity: 'info',
            message: message
        });
    };
    obj.debug = function (message) {
        this.emit('log', {
            type: 'log',
            severity: 'debug',
            message: message
        });
    };
    obj.error = function (message) {
        this.emit('log', {
            type: 'log',
            severity: 'error',
            message: message
        });
    };
};
