app.service('runRequestService', ['$rootScope', '$log', '$http', function ($rootScope, $log, $http) {

    var self = this;

    self.getRunPreview = function (componentId) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }

            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');

            var url = $rootScope.url + '/apis/components/' + componentId + '/preview';
            $log.log(url);

            $http.get(url, config).then(function (result) {
                resolve(result);
            });
        })
    }

    self.getRun = function (componentId) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }

            var accessToken = localStorage.getItem('accessToken');
            if (accessToken.length > 0) {
                config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
            }

            var url = $rootScope.url + '/apis/components/' + componentId;
            $log.log(url);

            $http.get(url, config).then(function (result) {
                resolve(result);
            });
        })
    }


}])