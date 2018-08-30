app.service('timeSeriesAnnotationService', ['$log', '$filter', function ($log, $filter) {

    var self = this;
    

    var annotationGroups = new Map();
     
   
    function annotationGroup(id,name,annotations = []){
        this.id=id;
        this.name=name;
        this.annotations=annotations;
    }

    function annotationBadge(annotationIdGroup,id,data,label = self.titleGen(annotationIdGroup)) {
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
        return newAnnotation
    }

    self.removeAnnotation = function(annotationGroupId,annotationId){
       var annotationGroup = annotationGroups.get(annotationGroupId);
       for(var i=0,n=annotationGroup.annotations.length;i<n;i++){
           if(annotationGroup.annotations[i].id === annotationId){
               annotationGroup.annotations.splice(i,1);
           }
       }
    }

    self.getAnnotations = function (annotationGroupId) {
         var annotationGroup = annotationGroups.get(annotationGroupId);
         if(annotationGroup != undefined){
             return annotationGroup.annotations;
         }else{
             return [];
         }
    }

    self.getAnnotation = function (annotationGroupId,annotationId) {
       var annotationGroup = annotationGroups.get(annotationGroupId);

       for(var i=0,n=annotationGroup.annotations.length;i<n;i++){
           if(annotationGroup.annotations[i].id === annotationId){
               return annotationGroup.annotations[i];
           }
       }
    }

    self.updateAnnotation = function(annotationGroupId,annotationId,updateData){
        var annotationGroup = annotationGroups.get(annotationGroupId);

        for(var i=0,n=annotationGroup.annotations.length;i<n;i++){
            if(annotationGroup.annotations[i].id === annotationId){
                annotations[i].data = updateData;
                return annotationGroup.annotations[i];
            }
        }
    }

    self.titleGen = function (annotationGroupId) {
        var annotationGroup = annotationGroups.get(annotationGroupId);
        var  asciiA = 65;
        var asciiValueNormalized = self.normalizeLength([0,26],[asciiA,91],annotationGroup.annotations.length % 26)
        $log.log(asciiValueNormalized);
        return (String.fromCharCode(asciiValueNormalized) + Math.floor(annotationGroup.annotations.length / 26));
    }

    self.normalizeLength = function(from,to,s){
        return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
    }

}])