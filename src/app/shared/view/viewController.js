app.controller('viewController', ['$scope', '$log','tagEditPanelService','columnTabPanelService','timeSeriesGraphControlService', function ($scope, $log,tagEditPanelService,columnTabPanelService,timeSeriesGraphControlService) {


    $scope.runs = [];
    $scope.tabs = [];

    $scope.activeTabIndex;

    $scope.isColumns = true;

    $scope.tags = ['tag1','tag2','tag3'];

    columnTabPanelService.getRun(['2B497C4DAFF48A9C!160', '2B497C4DAFF48A9C!178']).then(function(result){
        $scope.runs = result;
        $scope.tabs = columnTabPanelService.createRunTabs(result);
        $scope.$apply();

        timeSeriesGraphControlService.drawGraph(result);
    })

    $scope.selectedToggle = function(id,columnName){
        columnTabPanelService.selectedToggle(id,columnName);
    }

    $scope.tagEdit = function(){
        tagEditPanelService.showTagEditPanel(undefined,$scope.tags);
    }
    
    $scope.exists = function(id,columnName){
        return columnTabPanelService.exists(id,columnName);
    }

}])