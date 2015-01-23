module.exports = function (logBus, options) {
    return function (req, res, next) {
        res.set('Content-Type', 'application/x-ldjson');

        var query = {};
        Object.keys(req.query).forEach(function (key) {
            if (key !== 'timeout') {
                if (req.query[key] === '') {
                    query[key] = true;
                } else {
                    query[key] = req.query[key];
                }
            }
        });

        var subscription = logBus.subscribe(query, function (e) {
            res.write(JSON.stringify(e) + '\n');
        });

        if (req.query.timeout && typeof parseInt(req.query.timeout) === 'number' && parseInt(req.query.timeout) > 0) {
            setTimeout(function () {
                logBus.unsubscribe(subscription);
                res.end('');
            }, req.query.timeout);
        }

        res.on('close', function () {
            logBus.unsubscribe(subscription);
        });
    };
};
