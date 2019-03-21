app.filter('componentIdFilter', function () {
    return function (date, type) {
        if (type === 'url') {
            var dateArray = date.split("/");
            var date = ''
            for (var i = dateArray.length - 1; i >= 0; i--) {
                date += dateArray[i];
            }

            return date;

        } else {
            var year = date.slice(0, 4);
            var month = date.slice(4, 6);
            var day = date.slice(6);

            var date = day + '/' + month + '/' + year;
            return (date);

        }
    }
})