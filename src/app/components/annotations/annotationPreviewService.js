app.service('annotationPreviewService', ['$log', '$mdDialog', 'annotationsService', function ($log, $mdDialog, annotationsService) {

    var self = this;



    self.showAnnotationPreviewPanel = function (annotation) {
        
        return new Promise(function (resolve, reject) {
            $mdDialog.show({
                templateUrl: 'app/components/annotations/annotationPreview.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                locals: {
                    annotation: annotation,

                },
                controller: annotaionPreviewPanelController

            }).catch(function (annotation) {
                $log.log(annotation)
                if (annotation != undefined) {
                    resolve(annotation);
                } else {
                    reject();
                }
            })
        })
    }


    function annotaionPreviewPanelController($scope, $mdDialog, annotation, timeSeriesAnnotationService, authenticationService) {
        
        //holds original annotation description
        var lastAnnotationDesciption;

        //annotation panel title
        $scope.annotationTitle = 'Annotation ' + annotation.note.title;
        //annotation panel description
        $scope.annotationDescription = annotation.data.description;

        //which panel view to show, in edit or out of edit
        $scope.editMode = false;

        $log.log(annotation);
        
        //user editing annotation description
        $scope.annotationDescriptionEdit = function () {
            //store original annotation description
            lastAnnotationDesciption = $scope.annotationDescription;
            $scope.editMode = true;
        }

        $scope.confirmAnnotationDescription = function () {
            $scope.editMode = false;
        }

        $scope.confirmAnnotation = function () {
            annotation.data.description = $scope.annotationDescription;
            var updatedAnnotation = timeSeriesAnnotationService.updateAnnotation(annotation.data.groupId, annotation.id, annotation.data)
            console.log(updatedAnnotation.data.Time);
            annotationsService.updateAnnotation(updatedAnnotation.data.groupId,updatedAnnotation.id,{description: updatedAnnotation.data.description, xcoordinate : updatedAnnotation.data.Time}).then(function(result){
                console.log(result);
            }).catch(function(error){
                console.log(error);
            })
            $mdDialog.cancel();
        }

        $scope.cancelAnnotation = function () {
           
            $mdDialog.cancel();
        }

        $scope.cancelAnnotationDescription = function () {
            $scope.annotationDescription = lastAnnotationDesciption;
            $scope.editMode = false;
        }

        $scope.annotationDelete = function () {
            $log.log(annotation);
            timeSeriesAnnotationService.removeAnnotation(annotation.data.groupId, annotation.id);
            annotationsService.deleteAnnotation(annotation.data.groupId, annotation.id)
            $mdDialog.cancel();
        }

        $scope.annotationPosEdit = function () {
            $log.log(annotation);
            $mdDialog.cancel(annotation);
        }
        $scope.isAuthenticated = function(){
            $log.log('IS AUTH',authenticationService.isAuthenticated());
            return authenticationService.isAuthenticated();
        }
    }




}])