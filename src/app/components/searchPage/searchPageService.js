app.service('searchPageService', ['$log', 'tagPredictionService', 'searchService', 'queryKeywordService', function ($log, $tagPredictionService, searchService, queryKeywordService) {

    var self = this;

    

    self.search = function (query) {
        return new Promise(function (resolve, reject) {

           

            searchService.searchRequest(query).then(function(result){
                $log.log('result',result);
                resolve(result.data);
            })

        });
    }

    self.search1 = function (query){
        return new Promise(function (resolve, reject){
            $log.log('query', query);
            var queries = queryKeywordService.extractQueries(query);
            $log.log(queries);
        })
    }


    self.searchExtractV2 = function (search) {
        var queries = search.split('%20');
        var queryObject = {
            query: []
        }
        for (var i = 0, n = queries.length; i < n; i++) {
            queryObject.query.push(queries[i]);
        }

        return queryObject;

    }

    self.searchExtract = function (search) {
        var query = []
        var keywords = queryKeywordService.getKeywords();
        for (var i = 0, n = keywords.length; i < n; i++) {
            var regexResult = search.match(keywords[i].regex);

            if (regexResult != null) {

                if (keywords[i].singleton) {
                    regexResult = [regexResult[0]];
                }
                query.push({
                    name: keywords[i].name,
                    value: regexResult
                })
            }
        }
        return query;
    }


    self.queryUrlEncode = function (queryArray) {
        return new Promise(function (resolve, reject) {
            const promisesToResolve = queryArray.map(self.urlEncode);
            Promise.all(promisesToResolve).then(function (result) {
                for (var i = 0, n = queryArray.length; i < n; i++) {
                    queryArray[i].value = result[i];
                }
                resolve(queryArray);
            })
        })
    }

    self.urlEncode = function (queryObject) {
        return new Promise(function (resolve, reject) {
            queryKeywordService.urlEncode(queryObject.name, queryObject.value).then(function (result) {
                resolve(result);
            })
        });
    }

    self.queryUrlDecode = function (queryArray) {
        return new Promise(function (resolve, reject) {
            const promisesToResolve = queryArray.map(self.urlDecode);
            Promise.all(promisesToResolve).then(function (result) {
                for (var i = 0, n = queryArray.length; i < n; i++) {
                    queryArray[i].value = result[i]
                }
                resolve(queryArray);

            })
        });
    }






}])