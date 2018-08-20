app.controller('homeController', ['$scope', '$log', '$filter', 'authenticationService', 'oneDriveAuthenticationService', 'searchPageService', 'dtFormatterService', '$state', '$stateParams', 'JSTagsCollection', function ($scope, $log, $filter, authenticationService, oneDriveAuthenticationService, searchPageService, dtFormatterService, $state, $stateParams, JSTagsCollection) {

    this.uiOnParamsChanged = function (params) {
        if (params.query != undefined) {
            $scope.search(params.query);
            $scope.addTagsInput(params.query);
        }

    }

    $scope.search = function (query) {
        $log.log(query);
        searchPageService.search(query).then(function (result) {
            for(var i=0,n=result.length;i<n;i++){
                result[i].selected = false;
            }
            $scope.results = result;
            $scope.$apply();
        })
    }

    $scope.addTagsInput = function (query) {
        var queryArray = query.split(' ');
        queryArray = queryArray.splice(1);
        $scope.tags = new JSTagsCollection(queryArray);
        console.log($scope.tags);

    }


    if ($stateParams.query != undefined) {
       
        $scope.search($stateParams.query);
        $scope.addTagsInput($stateParams.query);
    }


    $scope.tags = new JSTagsCollection();

    // Export jsTags options, inlcuding our own tags object
    $scope.jsTagOptions = {
        'tags': $scope.tags,
        'texts': {
            'inputPlaceHolder': 'Search'
        }
    };



    // **** Typeahead code **** //

    // Build suggestions array
    var suggestions = ['gold', 'silver', 'golden'];
    suggestions = suggestions.map(function (item) { return { "suggestion": item } });

    // Instantiate the bloodhound suggestion engine
    var suggestions = new Bloodhound({
        datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.suggestion); },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: suggestions
    });


    // Initialize the bloodhound suggestion engine
    suggestions.initialize();

    // Single dataset example
    $scope.exampleData = {
        displayKey: 'suggestion',
        source: suggestions.ttAdapter()
    };

    // Typeahead options object
    $scope.exampleOptions = {
        hint: false,
        highlight: true
    };

    $scope.login = function () {
        authenticationService.login();
    }


    $scope.results = [];

    $scope.loginOneDrive = function () {
        oneDriveAuthenticationService.login();
    }

    
    $scope.searchClick = function () {
        $log.log($scope);
        $state.go('.', {
            query: encodeURI($scope.extractTags())
        });
       
    }

    
    $scope.extractTags = function () {
        var query = '';
        Object.keys($scope.tags.tags).forEach(function (key, index) {
            query += ' ' + ($scope.tags.tags[key].value);
        });
        return query;
    }

    $scope.dateDecode = function (date) {
        return dtFormatterService.dateDecode(date);
    }

    $scope.timeDecode = function (time) {
        return dtFormatterService.timeDecode(time);
    }


    
























}])