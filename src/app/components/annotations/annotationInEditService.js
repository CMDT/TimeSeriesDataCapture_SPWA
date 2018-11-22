app.service('annotationInEditService', ['$rootScope', '$log', function () {

    var self = this;
    //current annotationInEdit
    var annotationinEdit = {};

    //adds new annotation which is currently being edited
    // Storing only vital details : id, description and position (time)
    // 
    // Explaination : When user user clicks an annotation, these annotation details are stored within annotationInEdit
    //                If user changes position of annotation or decription and cancels changes, these stored details are
    //                used to revert changes made.
    self.addAnnotationInEdit = function (annotation) {
        if (annotationinEdit && annotationinEdit.id !== annotation.id) {
            annotationinEdit.id = annotation.id;
            annotationinEdit.description = annotation.data.description;
            annotationinEdit.Time = annotation.data.Time;
        }else{
            annotationinEdit = annotation;
        }
        

  
    }

    //clears annotation 
    self.clearAnnotationInEdit = function(){
        annotationinEdit = {};
    }

    //retrieves annotation
    self.getAnnotationInEdit = function(){
        return annotationinEdit;
    }








}])