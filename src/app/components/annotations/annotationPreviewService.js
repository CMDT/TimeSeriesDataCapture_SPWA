app.service('annotationPreviewService', ['$log', '$mdDialog', 'annotationInEditService', function ($log, $mdDialog, annotationInEditService) {

    var self = this;



    self.showAnnotationPreviewPanel = function (annotation) {
        return new Promise(function (resolve, reject) {
            annotationInEditService.addAnnotationInEdit(annotation);
            $mdDialog.show({
                templateUrl: 'app/components/annotations/annotationPreview.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                escapeToClose : false,
                locals: {
                    annotation: annotation,

                },
                controller: annotaionPreviewPanelController

            }).catch(function (annotation) {
                $log.log(annotation)
                if (annotation != undefined) {
                    resolve(annotation);
                } else {
                    annotationInEditService.clearAnnotationInEdit();
                    reject();
                }
            })
        })
    }


    function annotaionPreviewPanelController($scope, $mdDialog, annotation, timeSeriesAnnotationService,annotationsService,annotationInEditService, authenticationService) {
        
    
        
        //annotation panel title
        $scope.annotationTitle = 'Annotation ' + annotation.note.title;
        //annotation panel description
        $scope.annotationDescription = annotation.data.description;

        //which panel view to show, in edit or out of edit
        $scope.editMode = false;

    
        //user editing annotation description
        $scope.annotationDescriptionEdit = function () {
        
            //change panel view to edit mode
            $scope.editMode = true;
        }

        //user confirms new annotation description
        $scope.confirmAnnotationDescription = function () {
            //update annotation description
            annotation.data.description = $scope.annotationDescription;
            timeSeriesAnnotationService.updateAnnotation(annotation.data.groupId, annotation.id, annotation.data);
            //switch panel to normal view
            $scope.editMode = false;
        }

        //user confirms changes to annotation
        $scope.confirmAnnotation = function () {
            //update graph annotation
            annotation.data.description = $scope.annotationDescription;
            var updatedAnnotation = timeSeriesAnnotationService.updateAnnotation(annotation.data.groupId, annotation.id, annotation.data);
            
            //http request update annotation
            annotationsService.updateAnnotation(updatedAnnotation.data.groupId,updatedAnnotation.id,{description: updatedAnnotation.data.description, xcoordinate : updatedAnnotation.data.Time}).then(function(result){
                $mdDialog.cancel();
            }).catch(function(error){
                console.log(error);
            })
            
        }

        //user cancels changes to annotation
        $scope.cancelAnnotation = function () {
            //revert changes to annotation by using the annotationInEditService service
            annotation.data.description = annotationInEditService.getAnnotationInEdit().description;
            annotation.data.Time = annotationInEditService.getAnnotationInEdit().Time;
            timeSeriesAnnotationService.updateAnnotation(annotation.data.groupId, annotation.id, annotation.data);
            $mdDialog.cancel();
        }

        //user cancels annotation description
        $scope.cancelAnnotationDescription = function () {
            $scope.annotationDescription = annotationInEditService.getAnnotationInEdit().description;
            $scope.editMode = false;
        }

        //user deletes annotation
        $scope.annotationDelete = function () {
            //removes annotation from time series graph
            timeSeriesAnnotationService.removeAnnotation(annotation.data.groupId, annotation.id);
            //http request to delete annotation
            annotationsService.deleteAnnotation(annotation.data.groupId, annotation.id).then(function(result){
                console.log(result);
                $mdDialog.cancel();
            }).catch(function(error){
                console.log(error);
            })
            
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
            return authenticationService.isAuthenticated();
        }
    }




}])