app.service('paletteDataService', ['$rootScope', '$log', '$http', function ($rootScope, $log, $http) {

    var self = this;

    self.getPalette = function (palette) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }

            var url = $rootScope.url + '/apis/palette/'+palette;
            $log.log(url);

            return $http.get(url, config);
        })
    }

    



}])