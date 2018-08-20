app.controller('importController', ['$scope', '$log', '$mdDialog', 'getFolderService', '$transitions', 'oneDriveAuthenticationService', function ($scope, $log, $mdDialog, getFolderService, $transitions, oneDriveAuthenticationService) {

    $scope.showAdvanced = function (ev) {
        $mdDialog.show({

            templateUrl: 'app/shared/import/importPanel.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,

        })
    }

    $scope.test = function () {
        windowObjectReference = window.open("http://www.cnn.com/");
        $log.log(windowObjectReference);
    }







}])