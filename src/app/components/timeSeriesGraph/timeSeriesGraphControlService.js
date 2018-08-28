app.service('timeSeriesGraphControlService', ['$log', 'timeSeriesGraphService', 'timeSeriesAnnotationService', function ($log, timeSeriesGraphService, timeSeriesAnnotationService) {

    var self = this;


    self.drawGraph = function (runArray) {

        timeSeriesGraphService.graphInit();
        var runs = [];
        $log.log(runArray);
        runs = (self.parseDataToArray(runArray[0].runData));
        self.extractAnnotations(runArray[0].id, runArray[0].annotations);

       



        timeSeriesAnnotationService.addAnnotationGroup('2B497C4DAFF48A9C!178');
        timeSeriesAnnotationService.addAnnotation('2B497C4DAFF48A9C!178', '16884', { Time: 4000, description: 'Hi there' }, undefined);
    }

    self.parseRunArray = function (runArray) {
        var runs = []
        for (var i = 0, n = runArray.length; i < n; i++) {
            runs.push(parseDataToArray(runArray[i].runData));
            self.extractAnnotations(runArray[i].id, runArray[i].annotations);
        }
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




}])