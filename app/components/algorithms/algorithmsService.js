angular.module('app').service('algorithmsService', algorithmsService);

algorithmsService.$inject = [
    '$rootScope',
    '$log',
    '$http'
]


function algorithmsService(
    $rootScope,
    $log,
    $http
) {
    var self = this;

    self.getAllAlgorithms = getAllAlgorithms;

    function getAllAlgorithms() {

        var config = {
            headers: {},
            responseType: 'json'
        }
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');

        var url = $rootScope.url + '/apis/algorithms';
        return $http.get(url, config)
    }

}