app.service('timeSeriesTrendService', ['$log', function ($log) {

    var self = this;


    var trends = [];

    function trendLine(id, columnName, scaleX, scaleY, xLabel, yLabel, data = []) {
        this.id = id,
            this.columnName = columnName,
            this.scaleX = scaleX,
            this.scaleY = scaleY,
            this.xLabel = xLabel,
            this.yLabel = yLabel,
            this.data = data
    }




    self.addTrend = function (id, columnName,scaleX, scaleY, xLabel, yLabel, data) {
        var newTrend = new trendLine(id,columnName,scaleX, scaleY, xLabel, yLabel, data);
        trends.push(newTrend);
        return newTrend;
    }

    self.removeTrend = function (id, columnName) {
        for (var i = 0, n = trends.length; i < n; i++) {
            if (trends[i].id === id && trends[i].columnName === columnName) {
                trends.splice(i, 1);
            }
        }
    }

    self.getTrend = function (id, columnName) {
        for (var i = 0, n = trends.length; i < n; i++) {
            if (trends[i].id === id && trends[i].columnName === columnName) {
                return trends[i];
            }
        }
    }

    self.getTrends = function () {
        return trends;
    }

    self.clearTrends = function () {
        trends = [];
    }
}])