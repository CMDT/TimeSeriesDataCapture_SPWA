app.service('algorithmsService', ['$rootScope','$log','$http', function ($rootScope, $log, $http) {

    var self = this;

    self.getAllAlgorithms = function () {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');

            var url = $rootScope.url + '/apis/algorithms';
            $log.log(url);

            $http.get(url, config).then(function (result) {
                resolve(result);
            });
        })
    }

}])