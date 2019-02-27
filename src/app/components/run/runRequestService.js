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
            if (accessToken != null) {
                config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
            }

            var url = $rootScope.url + '/apis/components/' + componentId;
            $log.log(url);

            $http.get(url, config).then(function (result) {
                resolve(result);
            });
        })
    }

    // get run v2 is a single function that can handle any array of component ids or a single id.
    // removing the get run functions on columnTabPanelService
    //
    // TODO : needs testing

    // Gets runs data
    // Can either pass an array of Ids or a single Id
    //      - passing an array returns an object array
    //      - passing a single returns a object
    self.getRunV2 = function (componentIds) {
        return new Promise(function (resolve, reject) {

            if (!componentIds) { reject('componentIds not specified') }

            if (Array.isArray(componentIds)) {
                var getRunPromises = componentIds.map(_getRun);
                Promise.all(getRunPromises).then(function (result) {
                    resolve(result)
                })
            } else {
                //perform http request
                resolve(_getRun(componentIds));
            }
        });

    }

    self.getRuns = function (componentIds) {
        return new Promise(function (resolve, reject) {

            if (!componentIds) { reject('componentIds not specified') }


            var getRunPromises = componentIds.map(_getRun);
            Promise.all(getRunPromises).then(function (result) {
                resolve(result)
            })

        });
    }


    function _getRun(componentId) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }

            var accessToken = localStorage.getItem('accessToken');
            if (accessToken != null) {
                config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
            }

            var url = $rootScope.url + '/apis/components/' + componentId;
            $log.log(url);

            $http.get(url, config).then(function (result) {
                resolve(result);
            });
        })
    }

    self.deleteRun = function (components) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
            }

            config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');


            var url = $rootScope.url + '/apis/components/' + components[0];
            $log.log(url);

            $http.delete(url, config).then(function (result) {
                resolve(result);
            });
        })

    }


}])