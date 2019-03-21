app.service('exportDataService', ['$rootScope', '$log', '$http', function ($rootScope, $log, $http) {

    var self = this;

    self.getExport = function (componentId) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'arraybuffer'
            }

            var url = $rootScope.url + '/apis/export?componentIds='+componentId.join(',')+'&exportRequestId=test';

            $http.get(url, config).then(function (result) {
                var a = document.createElement('a');
                var blob = new Blob([result.data], { type: "octet/stream" });
                url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = 'runs.7z';
                a.click();
                window.URL.revokeObjectURL(url);
            });
        })
    }

    self.getExportProgress = function(exportRequestId){
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'arraybuffer'
            }

            var url = $rootScope.url + '/apis/exportProgess?exportRequestId='+exportRequestId;

            $http.get(url, config).then(function (result) {
               resolve(result);
            });
        })
    }

    self.postReserveExport = function(){
        return new Promise(function(resolve,reject){
            var config = {
                headers: {},
                responseType: 'json'
            }
          
            var url = $rootScope.url + '/apis/reserveExport';

            $http.post(url,undefined, config).then(function (result) {
                resolve(result);
            });
        })
    }




}])