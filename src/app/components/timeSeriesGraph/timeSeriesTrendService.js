app.service('timeSeriesTrendService', ['$log', function ($log) {

    var self = this;


    var trends = [];

    function trendLine(id, scaleX, scaleY,xLabel,yLabel, data = []) {
        this.id = id,
            this.scaleX = scaleX,
            this.scaleY = scaleY,
            this.xLabel = xLabel,
            this.yLabel = yLabel,
            this.data = data
    }




    self.addTrend = function (id, scaleX, scaleY,xLabel,yLabel, data) {
        var newTrend = new trendLine(id, scaleX, scaleY,xLabel,yLabel,data);
        trends.push(newTrend);
        return newTrend;
    }

    self.removeTrend = function (id) {
        for (var i = 0, n = trends.length; i < n; i++) {
            if (trends.id === id) {
                trends.splice(i, 1);
            }
        }
    }

    self.getTrend = function(id){
        for(var i=0,n=trends.length;i<n;i++){
            if(trends[i].id === id){
                return trends[i];
            }
        }
    }

    self.getTrends = function () {
        return trends;
    }

    self.clearTrends = function(){
        trends = [];
    }
}])