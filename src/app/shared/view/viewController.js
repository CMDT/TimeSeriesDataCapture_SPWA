app.controller('viewController', ['$scope', '$log', 'timeSeriesGraphService', function ($scope, $log, timeSeriesGraphService) {


    $scope.runs = [{
        id: 'run1',
        columns: ['column1', 'column2', 'column3']
    }, {
        id: 'run2',
        columns: ['column1', 'column2', 'column3']
    }]


    angular.element(document).ready(function () {
        var myEl = angular.element(document.querySelector('md-tab-item'));
        //$mdTabsCtrl.select(tab.getIndex())
        myEl.removeAttr('ng-click');
        //myEl.attr('ng-click','$mdTabsCtrl.select(tab.getIndex()');
    });

    $scope.test1 = function(){
        $log.log('click');
    }











}])