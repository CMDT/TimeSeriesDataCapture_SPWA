angular.module('app').service('graphEventEmitterService', graphEventEmitterService);

graphEventEmitterService.$inject = [
];


function graphEventEmitterService() {
    var self = this;

    self.publishAddTrend = publishAddTrend;
    self.subscribeAddTrend = subscribeAddTrend;

    self.publishRemoveTrend = publishRemoveTrend;
    self.subscribeRemoveTrend = subscribeRemoveTrend;

    var addTrendSubscribers = [];
    function publishAddTrend(runId, columnY){
        for(var i=0,length=addTrendSubscribers.length;i<length;i++){
            addTrendSubscribers[i](runId,columnY);
        }
    }
    function subscribeAddTrend(fn){
        addTrendSubscribers.push(fn);
    }

    
    var removeTrendSubscribers = [];
    function publishRemoveTrend(runId,columnY){
        for(var i=0,length=removeTrendSubscribers.length;i<length;i++){
            removeTrendSubscribers[i](runId,columnY);
        }
    }
    function subscribeRemoveTrend(fn){
        removeTrendSubscribers.push(fn);
    }

}