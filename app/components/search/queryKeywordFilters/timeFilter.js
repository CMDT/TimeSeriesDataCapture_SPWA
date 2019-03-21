app.filter('componentIdFilter', function () {
    return function (time, type) {
        if (type === 'url') {
            return (time.replace(/:/g, ''));

        } else {
            var decodeTime = ''
            for (var i = 0; i < 2; i++) {
                decodeTime += time.slice(i * 2, (i + 1) * 2) + ':';
            }
            decodeTime += time.slice(4, 6);
            return decodeTime;

        }
    }
})