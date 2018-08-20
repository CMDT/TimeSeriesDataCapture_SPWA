app.service('componentIdsService', ['$rootScope','$log','$http', function ($rootScope, $log, $http) {

    var self = this;



    self.updateAnnotationIds = function (componentId,annotationId,annotation) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
           
            var data = {

            }
            
            data.xcoordinate = annotation.Time;
            data.description = annotation.description;

            var url = $rootScope.url + '/apis/components/2B497C4DAFF48A9C!168/annotations/'+annotationId;
            $log.log(url);

            $http.put(url,data, config).then(function (result) {
                resolve(result);
            });
        })
    }

    
    

   

}])