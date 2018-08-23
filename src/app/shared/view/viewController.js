app.controller('viewController', ['$scope', '$log', 'runRequestService', 'timeSeriesGraphService','selectionService', function ($scope, $log, runRequestService, timeSeriesGraphService,selectionService) {


    $scope.runs = [];

    $scope.activeTabIndex;

   

    getData(['2B497C4DAFF48A9C!160', '2B497C4DAFF48A9C!178'])

    function getData(idArray) {
        var getRunPromises = idArray.map(runRequestService.getRun);
        Promise.all(getRunPromises).then(function (result) {
            var results = [];
            $log.log(result);
            for (var i = 0, n = result.length; i < n; i++) {
                results.push(result[i].data);
                selectionService.addSelectionGroup(result[i].data.id);
                extractColumnNames(result[i].data.id,result[i].data.runData)
                selectionService.selectedToggle(selectionService.getSelectionGroup(result[i].data.id),'RTH');
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

    $scope.selectedToggle = function(id,columnName){
        var selection = selectionService.getSelectionGroup(id);
        if(selectionService.isSelected(selection,columnName)){
            selectionService.removeSelected(selection,columnName);
            timeSeriesGraphService.deselectColumn(id,columnName);
        }else{
            selectionService.addSelected(selection,columnName);
            timeSeriesGraphService.selectedColumn(id,columnName);
        }

       
        
    }

    $scope.exists = function(id,columnName){
        return selectionService.isSelected(selectionService.getSelectionGroup(id),columnName);
    }











}])