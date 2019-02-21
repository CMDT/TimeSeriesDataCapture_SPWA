app.controller('homeController', ['$scope', '$rootScope', '$filter', '$log', '$mdDialog', 'authenticationService', 'searchService', '$state', '$stateParams', 'JSTagsCollection', 'selectionService', 'exportDataService', 'authenticationNotifyService', 'tagPredictionService', 'runRequestService', 'searchInputService', function ($scope, $rootScope, $filter, $log, $mdDialog, authenticationService, searchService, $state, $stateParams, JSTagsCollection, selectionService, exportDataService, authenticationNotifyService, tagPredicitionService, runRequestService, searchInputService) {

    $scope.loading = false;

    $scope.searchClick = searchClick;
    $scope.search = search;


    start();

    function searchClick() {
        var tags = searchInputService.getQuery();
        $state.go('.', {
            query: encodeURI(tags)
        }, {
                location: true,
                reload: true
            });
    }



    function search(query) {
        $scope.loading = true;
        searchService.searchRequest(query).then(function (result) {
            $scope.results = result.data;
            $scope.loading = false;
        }).catch(function (error) {
            console.error(error);
        })
    }

    function start() {
        if ($stateParams.query) {
            search($stateParams.query);
        }
        $scope.jsTagOptions = searchInputService.populateInput($stateParams.query);
        searchInputService.suggestions();
        $scope.exampleData = searchInputService.exampleData;

    }

   






    $scope.login = function () {
        authenticationNotifyService.subscribe('auth0', callback);
        authenticationService.login();
    }

    function callback() {
        $log.log($scope.isAuthenticated());
        $scope.$apply();
    }

    $scope.logout = function () {
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







    $scope.viewRun = function (run) {
        var options = {
            location: 'replace',
            inherit: false,
        }

        $state.transitionTo('view', {
            runs: run.id,
            columns: run.id + ':RTH',
            activeColumn: run.id + '+RTH',
            activeRun: run.id
        }, options);
    }

    var selectionId = selectionService.addSelectionGroup('runs', 'runsSelection');

    $scope.exists = function (runId) {
        return selectionService.isSelected(selectionService.getSelectionGroup(selectionId), runId);
    }

    $scope.selectedToggle = function (runId) {
        selectionService.selectedToggle(selectionService.getSelectionGroup(selectionId), runId);
    }

    $scope.view = function () {
        var selected = selectionService.selectedToArray(selectionId);

        var options = {
            location: 'replace',
            inherit: false,
        }

        $state.transitionTo('view', {
            runs: selected.join('+'),
            columns: selected[0] + ':RTH',
            activeColumn: selected[0] + '+RTH',
            activeRun: selected[0]
        }, options);
    }

    $scope.isAuthenticated = function () {
        return authenticationService.isAuthenticated();
    }

    $scope.export = function () {
        $log.log($scope.results);
        var selected = selectionService.selectedToArray(selectionId);
        exportDataService.getExport(selected).then(function (result) {
            $log.log(result);
        })
    }

    $scope.enabled = function () {
        return selectionService.selectedLength(selectionId) > 0;
    }

    $scope.deleteEnabled = function () {
        return selectionService.selectedLength(selectionId) == 1
    }

    $scope.delete = function () {
        var selected = selectionService.selectedToArray(selectionId);
        runRequestService.deleteRun(selected).then(function (result) {
            $log.log('item deleted');
            for (var i = 0; i < $scope.results.length; i++) {
                if ($scope.results[i].id == selected[0]) {
                    $log.log(selected[0]);
                    $scope.results.splice(i, 1);
                    $log.log($scope.results);
                    selectionService.removeSelected(selectionService.getSelectionGroup(selectionId), selected[0]);
                }
            }


        })


    }































}])