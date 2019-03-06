

app.service('annotationInEditService', annotationInEditService)

annotationInEditService.$inject = [
    '$rootScope',
    '$log'
];


function annotationInEditService(
    $rootScope,
    $log
) {
    var self = this;
    //current annotationInEdit
    var annotationinEdit = {};

    self.addAnnotationInEdit = addAnnotationInEdit;
    self.clearAnnotationInEdit = clearAnnotationInEdit;
    self.getAnnotationInEdit = getAnnotationInEdit;

    //adds new annotation which is currently being edited
    // Storing only vital details : id, description and position (time)
    // 
    // Explaination : When user user clicks an annotation, these annotation details are stored within annotationInEdit.
    //                If user changes position of annotation or decription and cancels changes, these stored details are
    //                used to revert changes made.
    function addAnnotationInEdit(annotation) {
        if (annotationinEdit && annotationinEdit.id !== annotation.id) {
            annotationinEdit.id = annotation.id;
            annotationinEdit.description = annotation.data.description;
            annotationinEdit.Time = annotation.data.Time;
        } else {
            annotationinEdit = annotation;
        }
    }

    //clears annotation 
    function clearAnnotationInEdit() {
        annotationinEdit = {};
    }

    //retrieves annotation
    function getAnnotationInEdit() {
        return annotationinEdit;
    }
}