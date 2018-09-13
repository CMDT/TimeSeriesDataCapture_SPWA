app.controller('homeController', ['$scope','$rootScope', '$log','$mdDialog', 'authenticationService', 'searchPageService', '$state', '$stateParams', 'JSTagsCollection','selectionService','exportDataService','authenticationNotifyService', function ($scope,$rootScope, $log,$mdDialog, authenticationService, searchPageService, $state, $stateParams, JSTagsCollection,selectionService,exportDataService,authenticationNotifyService) {

    $scope.loading = false;
    
    this.uiOnParamsChanged = function (params) {
        if (params.query != undefined) {
            $scope.search(params.query);
            $rootScope.query = params.query;
        }
    }

    $scope.search = function (query) {
        $log.log('search query ' + query);
        $scope.loading = true;
        searchPageService.search(query).then(function (result) {
            $scope.results = result;
            $scope.loading = false;
            $scope.$apply();
        })
    }

    $scope.addTagsInput = function (query) {
        console.log('add tags' + query);
        var queryArray = query.split('%20');
        queryArray = queryArray.splice(1);
        $scope.tags = new JSTagsCollection(queryArray);
        $log.log($scope);
    }


    if ($stateParams.query != undefined) {
        $scope.search($stateParams.query);
        $scope.addTagsInput($stateParams.query);
    } else {
        $scope.tags = new JSTagsCollection();
    }


    // Export jsTags options, inlcuding our own tags object
    $scope.jsTagOptions = {
        'tags': $scope.tags,
        'texts': {
            'inputPlaceHolder': 'Search'
        }
    };

    // Build suggestions array
    var suggestions = ['gold', 'silver', 'golden'];
    suggestions = suggestions.map(function (item) {
        return {
            "suggestion": item
        }
    });

    // Instantiate the bloodhound suggestion engine
    var suggestions = new Bloodhound({
        datumTokenizer: function (d) {
            return Bloodhound.tokenizers.whitespace(d.suggestion);
        },
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
        authenticationNotifyService.subscribe('auth0',callback);
        authenticationService.login();
    }

    function callback(){
        $log.log($scope.isAuthenticated());
        $scope.$apply();
    }

    $scope.logout = function(){
        authenticationService.logout();
    }

    $scope.results = [];

    $scope.import = function (ev) {
        $mdDialog.show({
            templateUrl: 'app/shared/import/importPanel.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
        })
    }


    $scope.searchClick = function () {
        $log.log('search tags' + $scope.extractTags());
        $state.go('.', {
            query: encodeURI($scope.extractTags())
        });
    }


    $scope.extractTags = function () {
        var query = '';
        console.log($scope.tags);
        Object.keys($scope.tags.tags).forEach(function (key, index) {
            query += ' ' + ($scope.tags.tags[key].value);
        });
        return query;
    }


    $scope.viewRun = function(run){
        var options = {
            location: 'replace',
            inherit: false,
        }

        $state.transitionTo('view',{
            runs: run.id,
            columns : run.id + ':RTH',
            activeColumn: run.id + '+RTH',
            activeRun: run.id
        },options);
    }

    var selectionId = selectionService.addSelectionGroup('runs','runsSelection');

    $scope.exists = function(runId){
        return selectionService.isSelected(selectionService.getSelectionGroup(selectionId),runId);
    }

    $scope.selectedToggle = function(runId){
        selectionService.selectedToggle(selectionService.getSelectionGroup(selectionId),runId);
    }

    $scope.view = function(){
        var selected = selectionService.selectedToArray(selectionId);
        
        var options = {
            location: 'replace',
            inherit: false,
        }

        $state.transitionTo('view',{
            runs: selected.join('+'),
            columns : selected[0] + ':RTH',
            activeColumn: selected[0] + '+RTH',
            activeRun: selected[0]
        },options);
    }

    $scope.isAuthenticated = function(){
        return authenticationService.isAuthenticated();
    }

    $scope.export = function(){
        var selected = selectionService.selectedToArray(selectionId);
        exportDataService.getExport(selected).then(function(result){
            $log.log(result);
        })
    }

    $scope.enabled = function(){
        var test = selectionService.selectedLength(selectionId);
        return selectionService.selectedLength(selectionId) > 0;
    }

    





























}])