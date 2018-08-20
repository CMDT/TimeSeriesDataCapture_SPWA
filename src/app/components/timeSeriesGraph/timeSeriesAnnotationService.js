app.service('timeSeriesAnnotationService', ['$log', '$filter', function ($log, $filter) {

    var self = this;
    var annotations = [];

    var annotationGroups = new Map();
     
   
    function annotationGroup(id,name,annotations = []){
        this.id=id;
        this.name=name;
        this.annotations=annotations;
    }

    function annotationBadge(annotationIdGroup,id,data,label = self.titleGen()) {
        this.annotationIdGroup = annotationIdGroup;
        this.id = id;
        this.title = label;
        this.data = data;
        this.note = {
            label: 'Label',
            title: label
        };
        this.subject = {
            text: label,
            y: 'top',
        };
    }

    self.addAnnotationGroup = function (id,name,annotations){
        var newAnnotationGroup = new annotationGroup(id,name,annotations);
        annotationGroups.set(id,newAnnotationGroup);
        return id;
    }

    self.removeAnnotationGroup = function (id){
        annotationGroups.delete(id);
    }

    self.addAnnotation = function (annotationGroupId,id,data,label) {
        
        var newAnnotation = new annotationBadge(annotationGroupId,id,data,label);
        var annotationGroup = annotationGroups.get(annotationGroupId);
        annotationGroup.annotations.push(newAnnotation);
    }

    self.removeAnnotation = function(annotationGroupId,annotationId){
       var annotationGroup = annotationGroups.get(annotationGroupId);
       for(var i=0,n=annotationGroup.annotations.length;i<n;i++){
           if(annotationGroup.annotations[i].id === annotationId){
               annotationGroup.annotations[i].splice(i,1);
           }
       }
    }

    self.getAnnotations = function (annotationGroupId) {
        return annotationGroups.get(annotationGroupId).annotations;
    }

    self.getAnnotation = function (annotationGroupId,annotationId) {
       var annotationGroup = annotationGroups.get(annotationGroupId);

       for(var i=0,n=annotationGroup.annotations.length;i<n;i++){
           if(annotationGroup.annotations[i].id === annotationId){
               return annotationGroup.annotations[i];
           }
       }
    }

    self.updateAnnotation = function(title,updateData){
        for(var i=0,n=annotations.length;i<n;i++){
            if(annotations[i].title === title){
                annotations[i].data = updateData;
                return annotations[i];
            }
        }
    }

    self.titleGen = function () {
        asciiA = 65;
        asciiValue = asciiA + annotations.length;
        return String.fromCharCode(asciiValue);
    }

}])