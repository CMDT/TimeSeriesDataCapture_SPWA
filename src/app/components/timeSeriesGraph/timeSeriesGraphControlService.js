app.service('timeSeriesGraphControlService', ['$log', 'timeSeriesGraphService', 'timeSeriesAnnotationService', function ($log, timeSeriesGraphService, timeSeriesAnnotationService) {

    var self = this;
    var timeSeriesData;

    self.drawGraph = function (runArray) {
        $log.log('drawing graph');
        var runs = [];
    
        for (var i = 0, n = runArray.length; i < n; i++) {
            var runData = self.parseDataToArray(runArray[i].runData);
            runs.push({
                id: runArray[i].id,
                values : runData
            })
            self.extractAnnotations(runArray[i].id, runArray[i].annotations);
        }

        timeSeriesData = runs;

        timeSeriesGraphService.graphInit();
        timeSeriesGraphService.drawGraph(runs)
    }

    self.parseRunArray = function (runArray) {
        var runs = []
        for (var i = 0, n = runArray.length; i < n; i++) {
            runs.push(parseDataToArray(runArray[i].runData));
            self.extractAnnotations(runArray[i].id, runArray[i].annotations);
        }
        return runs;
    }

    self.extractAnnotations = function (annotationGroupId, annotations) {
        timeSeriesAnnotationService.addAnnotationGroup(annotationGroupId);
        var annotationIds = Object.keys(annotations);

        for (var i = 0, n = annotationIds.length; i < n; i++) {
            annotations[annotationIds[i]].id = annotationIds[i];
            self.createAnnotation(annotationGroupId, annotations[annotationIds[i]]);
        }
    }

    self.createAnnotation = function (annotationGroupId, annotation) {
        var data = {
            Time: annotation.xcoordinate,
            description: annotation.description,
            groupId: annotationGroupId
        }
        
        timeSeriesAnnotationService.addAnnotation(annotationGroupId, annotation.id, data, undefined);
    }

    self.parseDataToArray = function (dataObject) {
        var dataArray = [];
        

        //converts each column array into an array of object rows
        var objectKeys = Object.keys(dataObject);
        for (var i = 0, n = dataObject[objectKeys[0]].length; i < n; i++) {
            var row = {};
            for (var o = 0, m = objectKeys.length; o < m; o++) {
                row[objectKeys[o]] = Number(dataObject[objectKeys[o]][i]);
            }
            dataArray.push(row);
        }
        return dataArray;
    }

    self.addTrend = function(id,columnName){
       
        var data;
        for(var i=0, n= timeSeriesData.length; i<n;i++){
            if(timeSeriesData[i].id === id){
                data = timeSeriesData[i].values
                break;
            }
        }
        
        timeSeriesGraphService.addTrend(id,columnName,data);
    }

    self.removeTrend = function(id,columnName){
        $log.log(columnName);
        timeSeriesGraphService.removeTrend(id,columnName);
    }

    

    self.graphTransition = function(transitionVector,offsetVector){
        timeSeriesGraphService.transition(transitionVector,offsetVector);
    }

   
    self.setActiveRun = function(runId){
        timeSeriesGraphService.setActiveRun(runId);
    }

    self.setActiveColumn = function(columnName){
        timeSeriesGraphService.setActiveColumn(columnName);
    }

    self.getActiveRun = function(){
        return timeSeriesGraphService.getActiveRun();
    }

    self.getActiveColumn = function(){
        return timeSeriesGraphService.getActiveColumn();
    }

    




}])