app.service('searchService', ['$log', '$http','$rootScope', 'queryKeywordService', function ($log, $http,$rootScope, queryKeywordService) {

    var self = this;

    
    self.searchRequest = function (query) {
        var config = {
            params: {},
            responseType: 'json',
            headers: {}
        }

        var url = $rootScope.url + '/apis/search';
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
        config.params.tags = encodeURI(query);
        
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