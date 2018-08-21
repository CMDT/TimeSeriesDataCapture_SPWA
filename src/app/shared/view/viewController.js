app.controller('viewController', ['$scope', '$log', 'runRequestService', 'timeSeriesGraphService', function ($scope, $log, runRequestService, timeSeriesGraphService) {


    $scope.runs = [];

    $scope.activeTabIndex;

    angular.element(document).ready(function () {
        $log.log($scope.activeTabIndex);
    });

    $scope.test1 = function () {
        $log.log($scope.activeTabIndex);
    }

    getData(['2B497C4DAFF48A9C!160', '2B497C4DAFF48A9C!178'])

    function getData(idArray) {
        var getRunPromises = idArray.map(runRequestService.getRun);
        Promise.all(getRunPromises).then(function (result) {
            var results = [];
            $log.log(result);
            for (var i = 0, n = result.length; i < n; i++) {
                results.push(result[i].data);
                extractColumnNames(result[i].data.id,result[i].data.runData)
            }
            timeSeriesGraphService.graphInit(results);
        });
    }

    function extractColumnNames(id, runData) {
        
        var tabObject = {
            id: id,
            columns: []
        }

        var runKeys = Object.keys(runData);
        tabObject.columns = (runKeys);
        $scope.runs.push(tabObject);
        $log.log($scope.runs);
        $scope.$apply();
    }











}])