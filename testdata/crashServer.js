var app = require('express')();

app.use('/kill', function (req, res, next) {
    process.exit(1);
});

// Hang tests doesn't make sense... There wouldn't be any way to tell
// if it's just a bored worker or if it's hanging...

app.use('/hangHard', function (req, res, next) {});

app.use('/hang', function (req, res, next) {
    res.header('Content-Type', 'application/json');
    res.write('{');
});

app.use('/uncaughtException', function (req, res, next) {
    asyncThrow();
});

var server = app.listen(0, function () {
    if (process.send) {
        process.send({
            port: server.address().port
        });
    } else {
        console.log('port', server.address().port);
    }
});

function asyncThrow() {
    setImmediate(function () {
        throw new Error('FOOBAR!');
    });
}

process.on('message', function (msg) {
    if (msg === 'die') {
        process.exit(0);
    }
});
