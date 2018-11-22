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
            //change panel view to edit mode
            $scope.editMode = true;
        }

        //user confirms new annotation description
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

        //user cancels annotation description
        $scope.cancelAnnotationDescription = function () {
            $scope.annotationDescription = lastAnnotationDesciption;
            $scope.editMode = false;
        }

        //user deletes annotation
        $scope.annotationDelete = function () {
            $log.log(annotation);
            //removes annotation from time series graph
            timeSeriesAnnotationService.removeAnnotation(annotation.data.groupId, annotation.id);
            //removes annotation from whole collection of annotations
            annotationsService.deleteAnnotation(annotation.data.groupId, annotation.id)
            $mdDialog.cancel();
        }

        //user editing the position of annotation
        //  annotation panel closes, and annotation controls are shown
        $scope.annotationPosEdit = function () {
            $log.log(annotation);
            $mdDialog.cancel(annotation);
        }

        //checks if user is authenticated
        //  non-authenticated : user can view description, cannot edit anything
        //  authenticated : user can edit description, position or delete annotation
        $scope.isAuthenticated = function(){
            $log.log('IS AUTH',authenticationService.isAuthenticated());
            return authenticationService.isAuthenticated();
        }
    }




}])