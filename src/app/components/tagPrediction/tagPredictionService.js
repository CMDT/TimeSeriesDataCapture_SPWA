app.service('tagPredictionService', ['$log', '$http', function ($log, $http) {

  
    this.getTagId = function(tag){
        var config = {
            params  : {
                tags:tag
            },
            responseType: 'json'
        }

        var url= 'http://10.182.45.87:8000/apis/tags';


        return $http.get(url,config);
    }

    this.getTagIds = function(tagArray){
        return new Promise(function(resolve,reject){
            const tagIdPromises = tagArray.map(self.getTagID);
            Promise.all(tagIdPromises).then(function (result) {
                var parsedResult = [];
                for (var i = 0, n = result.length; i < n; i++) {
                    parsedResult.push(result[i][0]);
                }
                resolve(parsedResult);
            })
        });
    }


}])