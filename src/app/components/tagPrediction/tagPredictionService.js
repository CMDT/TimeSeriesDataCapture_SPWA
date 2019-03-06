app.service('tagPredictionService', ['$rootScope','$log', '$http', function ($rootScope,$log, $http,) {

    var self = this;
  
    self.getTag = function(tag=''){
        var config = {
            responseType: 'json',
            params : {}
        }

        var url= $rootScope.url + '/apis/tags';

        if(tag != undefined){
            config.params =  {
                tags:tag 
            }
        }
        return $http.get(url,config);
    }

    self.getTags = function(tagArray){
        return new Promise(function(resolve,reject){
            const tagIdPromises = tagArray.map(self.getTag);
            Promise.all(tagIdPromises).then(function (result) {
                var parsedResult = [];
                for (var i = 0, n = result.length; i < n; i++) {
                    parsedResult.push(result[i][0]);
                }
                resolve(parsedResult);
            })
        });
    }

    self.addTags = function(componentId,tagArray){
        var config = {
            headers: {},
            responseType: 'json'
        }
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');

        var url = $rootScope.url + '/apis/components/' +componentId + '/tags/';
        $log.log(url);

        return $http.put(url,tagArray,config);
        
    }

     self.deleteTagById = function(componentId,tagId){
        var config = {
            headers: {},
            responseType: 'json'
        }
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');

        var url = $rootScope.url + '/apis/components/' +componentId + '/tags/' + tagId;
        $log.log(url);

        return $http.delete(url,config);
    }
    

    self.deleteTag = function (tag){
        var componentId = this.componentId;
        return new Promise(function(resolve,reject){
            self.getTag(tag).then(function(result){
                if(result.data.length > 0){
                    self.deleteTagById(componentId,result.data[0]._id);
                    resolve(result.data[0]._id + ' deleted');
                }else{
                    reject('tag not found');
                }
            });
        })
    }

}])