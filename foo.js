require('express')().use(function (req, res, next) {
	res.status(200);
	var n = 0;
	var intervalId = setInterval(function () {
		res.write('{"foo": "bar"}\n');
		n += 1;
		if (n === 5) {
			res.end();
			clearInterval(intervalId);
		}
	}, 1000);
}).listen(1337)
