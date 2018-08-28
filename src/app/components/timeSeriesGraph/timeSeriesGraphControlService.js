app.service('timeSeriesGraphControlService', ['$log', 'timeSeriesGraphService', 'timeSeriesAnnotationService', function ($log, timeSeriesGraphService, timeSeriesAnnotationService) {

    var self = this;


    self.drawGraph = function (runArray) {
        var runs = [];
        $log.log(runArray);
       
        for (var i = 0, n = runArray.length; i < n; i++) {
            var runData = self.parseDataToArray(runArray[i].runData);
            $log.log(runData);
            runs.push({
                id: runArray[i].id,
                values : runData
            })
            self.extractAnnotations(runArray[i].id, runArray[i].annotations);
        }

        timeSeriesGraphService.graphInit();
        timeSeriesGraphService.drawGraph(runs)

        self.graphTransition(0.8,0,0);
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
            description: annotation.description
        }
        $log.log(annotation);
        $log.log(data);
        timeSeriesAnnotationService.addAnnotation(annotationGroupId, annotation.id, data, undefined);
    }

    self.parseDataToArray = function (dataObject) {
        var dataArray = [];
        $log.log(dataObject);

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

    self.graphTransition = function(scale,x,y){
        timeSeriesGraphService.transition(scale,x,y);
    }

    self.graphOffset = function(x,y){
        timeSeriesGraphService.transition(x,y);
    }




}])