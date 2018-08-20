app.service('searchService', ['$log', '$http','$rootScope', 'queryKeywordService', function ($log, $http,$rootScope, queryKeywordService) {

    var self = this;

    
    self.searchRequest = function (queryArray) {
        var config = {
            params: {},
            responseType: 'json'
        }

        var url = $rootScope.url + '/apis/search?query=gold';

        for(var i=0,n=queryArray.length;i<n;i++){
            var value = queryArray[i].value;
            if(value.length > 1){
                config.params[queryArray[i].name] = self.queryParamArray(value);
            }else{
        
                config.params[queryArray[i].name] = value[0];
            }
        }
        var url = $rootScope.url + '/apis/search?query=silver';
        $log.log(url);
        return $http.get(url, config);
    }

    self.queryParamArray = function(param){
        var parseParam = '';
        for(var i=0,n=param.length-1;i<n;i++){
            parseParam += param[i] + ',';
        }
        parseParam += param[param.length-1];
        return parseParam;
    }

    
}])