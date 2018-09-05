
app.service('fileStorageAuthenticationDataService', ['$rootScope', '$log', '$http',function ($rootScope, $log, $http) {

    var self = this;

    self.postAuthentication = function (authentication) {

        var config = {
            headers: {}
        }
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');

        var url = $rootScope.url + '/apis/authenticate';


        return $http.post(url, authentication, config)
    }

    self.deleteAuthentication = function(){
        var profileId = (localStorage.getItem('profile'));


        var config = {
            headers: {},
            data: {
                profileID : profileId
            }
        }

        config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');

        var url = $rootScope.url + '/apis/authenticate';
        return $http.delete(url,config);
    }





}])