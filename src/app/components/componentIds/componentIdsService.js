app.service('componentIdsService', ['$rootScope','$log','$http','authenticationService', function ($rootScope, $log, $http,authenticationService) {

    var self = this;



    self.getComponentIds = function (folderId) {
        return new Promise(function (resolve, reject) {
            var config = {
                params: {},
                headers: {},
                responseType: 'json'
            }
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
            config.params.folderID = folderId;

            var url = $rootScope.url + '/apis/components';
            $log.log(url);

            $http.get(url, config).then(function (result) {
                resolve(result);
            }).catch(function(error){
                if(error.status === 401){

                    if(error.data != null){
                        if(error.data.message === 'Authorization failed: Un-authorized'){
                           reject('fileStorageUnAuthenticated')
                        }
                    }else{
                        $log.log('login to Auth0');
                    }
                }
            });
        })
    }

    self.postComponentIds = function (components) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
           

            var url = $rootScope.url + '/apis/components';
            $log.log(url);

            $http.post(url,components, config).then(function (result) {
                resolve(result);
            });
        })
    }

    

   

}])