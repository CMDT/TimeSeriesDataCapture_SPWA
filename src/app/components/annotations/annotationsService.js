app.service('annotationsService', ['$rootScope','$log','$http', function ($rootScope, $log, $http) {

    var self = this;



    self.updateAnnotation = function (componentId,annotationId,annotation) {
      
            var config = {
                headers: {},
                responseType: 'json'
            }
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
           
           

            var url =  $rootScope.url + '/apis/components/'+componentId+'/annotations/'+annotationId;
            $log.log(url);
            $log.log(annotation);

           return $http.put(url,annotation, config)
    }

    self.addAnnotations = function (componentId,annotations){
       
            var config = {
                headers: {},
                responseType: 'json'
            }
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
           
            var url =  $rootScope.url+'/apis/components/'+componentId+'/annotations'
            $log.log(url);

            return $http.post(url,annotations, config);
              
    }

    self.deleteAnnotation = function (componentId,annotationId){
      
            var config = {
                headers: {},
                responseType: 'json'
            }
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
           
            var url =   $rootScope.url+'/apis/components/'+componentId+'/annotations/'+annotationId;
            $log.log(url);

            return $http.delete(url, config)
    }

    
    

   

}])