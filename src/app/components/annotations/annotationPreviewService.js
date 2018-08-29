app.service('annotationPreviewService', ['$log', '$mdDialog', function ($log, $mdDialog) {

    var self = this;



    self.showAnnotationPreviewPanel = function (annotation) {
        return new Promise(function (result, reject) {
            $mdDialog.show({
                templateUrl: 'app/components/annotations/annotationPreview.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                locals: {
                    annotation: annotation
                },
                controller: annotaionPreviewPanelController

            }).catch(function (annotation) {
                $log.log(annotation)
                if (annotation != undefined) {
                    
                    //resolve();
                } else {
                    //reject(annotation);
                }
            })
        })
    }

    function annotaionPreviewPanelController($scope, $mdDialog, annotation, timeSeriesAnnotationService) {
  
        var savedAnnotation;
        $scope.annotationTitle = 'Annotation ' + annotation.note.title;
        $scope.annotationDescription = annotation.data.description;
        $scope.editMode = false;

        $log.log(annotation);
        if (savedAnnotation != undefined) {
            $log.log('hit');
            if (savedAnnotation.data.Time != annotation.data.Time) {
                var updatedannotation = timeSeriesAnnotationService.updateAnnotation(annotation.note.title, annotation.data);
                $log.log(updatedannotation);
            }
        }

        $scope.annotationEdit = function () {
            lastAnnotationDesciption = $scope.annotationDescription;
            $scope.editMode = !($scope.editMode);
        }

        $scope.confirm = function () {
            $log.log($scope.annotationDescription);
            var newData = {
                Time: annotation.data.Time,
                RTH: annotation.data.RTH,
                description: $scope.annotationDescription
            }
            var updatedannotation = timeSeriesAnnotationService.updateAnnotation(annotation.note.title, newData);
            annotation.data = newData;
            $scope.editMode = false;
        }

        $scope.cancel = function () {
            $scope.annotationDescription = lastAnnotationDesciption;
            $scope.editMode = false;
        }

        $scope.deleteAnnotation = function () {
            timeSeriesAnnotationService.removeAnnotation(timeSeriesGraphService.getActiveRunId(), annotation.id);
            $mdDialog.cancel();
        }

        $scope.annotationPosEdit = function () {
            $log.log(annotation);
            savedAnnotation = annotation;
            $mdDialog.cancel(annotation);
        }
    }




}])