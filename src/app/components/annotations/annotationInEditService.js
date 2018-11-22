app.service('annotationInEditService', ['$rootScope', '$log', function () {

    var self = this;

    var annotationinEdit = {};

    self.addAnnotationInEdit = function (annotation) {
        if (annotationinEdit && annotationinEdit.id !== annotation.id) {
            annotationinEdit.id = annotation.id;
            annotationinEdit.description = annotation.data.description;
            annotationinEdit.Time = annotation.data.Time;
        }else{
            annotationinEdit = annotation;
        }
        

  
    }

    self.clearAnnotationInEdit = function(){
        annotationinEdit = {};
    }

    self.getAnnotationInEdit = function(){
        return annotationinEdit;
    }








}])