app.service('algorithmsService', ['$rootScope','$log','$http', function ($rootScope, $log, $http) {

    var self = this;

    self.getAllAlgorithms = function () {
       
            var config = {
                headers: {},
                responseType: 'json'
            }
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');

            var url = $rootScope.url + '/apis/algorithms';
            $log.log(url);

            return $http.get(url, config)
    }

}])