angular.module('app').controller('homeController', homeController);

homeController.$inject = [
    '$scope',
    '$log',
    '$mdDialog',
    'authenticationService',
    'searchService',
    '$state',
    '$stateParams',
    'selectionService',
    'exportDataService',
    'authenticationNotifyService',
    'runRequestService',
    'searchInputService'
];


function homeController($scope,$log, $mdDialog, authenticationService, searchService, $state, $stateParams, 
    selectionService, exportDataService, authenticationNotifyService,runRequestService, searchInputService) {
   
    start();

    var selectionId = selectionService.addSelectionGroup('runs', 'runsSelection');


    $scope.results = [];
    $scope.loading = false;

    $scope.searchClick = searchClick;
    $scope.search = search;

    $scope.login = login;
    $scope.logout = logout;

    $scope.importClick = importClick;
    $scope.viewClick = viewClick;
    $scope.exportClick = exportClick;
    $scope.deleteClick = deleteClick;

    $scope.exists = exists;
    $scope.selectedToggle = selectedToggle;
    $scope.enabled = enabled;

    $scope.isAuthenticated = isAuthenticated;



    function start() {
        if ($stateParams.query) {
            search($stateParams.query);
        }
        $scope.jsTagOptions = searchInputService.populateInput($stateParams.query);
        searchInputService.suggestions();
        $scope.exampleData = searchInputService.exampleData;

    }

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

    function login() {
        authenticationNotifyService.subscribe('auth0', function () {
            $scope.$apply();
        });
        authenticationService.login();
    }

    function logout() {
        authenticationService.logout();
    }

    function importClick(ev) {
        $mdDialog.show({
            templateUrl: 'app/shared/import/importPanel.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
        })
    }

    function viewClick(run) {
        if (!run) {
            selected = selectionService.selectedToArray(selectionId);
            runs = selected.join('+');
        } else {
            runs = run.id;
        }

        $state.transitionTo('view', {
            runs: runs,
        },{
            location: 'replace',
            inherit: false,
        });
    }

    function exportClick() {
        var selected = selectionService.selectedToArray(selectionId);
        exportDataService.getExport(selected);
    }

    function deleteClick() {
        var selected = selectionService.selectedToArray(selectionId);
        runRequestService.deleteRun(selected[0]).then(function (result) {
            $log.log('item deleted');
            for (var i = 0; i < $scope.results.length; i++) {
                if ($scope.results[i].id == selected[0]) {
                    $scope.results.splice(i, 1);
                    selectionService.removeSelected(selectionService.getSelectionGroup(selectionId), selected[0]);
                }
            }
        })
    }

    function exists(runId) {
        return selectionService.isSelected(selectionService.getSelectionGroup(selectionId), runId);
    }

    function selectedToggle(runId) {
        selectionService.selectedToggle(selectionService.getSelectionGroup(selectionId), runId);
    }

    function enabled() {
        return selectionService.selectedLength(selectionId) > 0;
    }

    function isAuthenticated() {
        return authenticationService.isAuthenticated();
    }
}



    
















    






























