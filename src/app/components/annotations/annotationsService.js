app.service('annotationsService', ['$rootScope','$log','$http', function ($rootScope, $log, $http) {

    var self = this;



    self.updateAnnotation = function (componentId,annotationId,annotation) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
           
           

            var url = 'http://localhost:8000/apis/components/'+componentId+'/annotations/'+annotationId;
            $log.log(url);
            $log.log(annotation);

            $http.put(url,annotation, config).then(function (result) {
                resolve(result);
            });
        })
    }

    self.addAnnotations = function (componentId,annotations){
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
           
            var url = 'http://localhost:8000/apis/components/'+componentId+'/annotations'
            $log.log(url);

            $http.post(url,annotations, config).then(function (result) {
                resolve(result);
            });
        })
    }

    self.deleteAnnotation = function (componentId,annotationId){
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
           
            var url =  'http://localhost:8000/apis/components/'+componentId+'/annotations/'+annotationId;
            $log.log(url);

            $http.delete(url, config).then(function (result) {
                resolve(result);
            });
        })
    }

    
    

   

}])