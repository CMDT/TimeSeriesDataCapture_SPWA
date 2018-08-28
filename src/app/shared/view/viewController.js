app.controller('viewController', ['$scope', '$log', '$state', '$stateParams', '$location', 'tagEditPanelService', 'columnTabPanelService', 'timeSeriesGraphControlService', function ($scope, $log, $state, $stateParams, $location, tagEditPanelService, columnTabPanelService, timeSeriesGraphControlService) {


    $scope.runs = [];
    $scope.tabs = [];

    $scope.activeTabIndex;

    $scope.isColumns = true;

    $scope.tags = ['tag1', 'tag2', 'tag3'];

    columnTabPanelService.getRun(['2B497C4DAFF48A9C!160', '2B497C4DAFF48A9C!178']).then(function (result) {
        $scope.runs = result;
        $scope.tabs = columnTabPanelService.createRunTabs(result);
        $log.log($scope.tabs);
        $scope.$apply();

        timeSeriesGraphControlService.drawGraph(result);
    })

    $scope.selectedToggle = function (id, columnName) {

        $log.log('selected');
        var selectedColumns = columnTabPanelService.columnSelectToggle(id,columnName);
        var columnParam = '';
        for(var i=0,n=selectedColumns.length;i<n;i++){
            var id= selectedColumns[i].selectionGroup;
            for(o=0,m=selectedColumns[i].selected.length;o<m;o++){
                columnParam += id + ':'+ selectedColumns[i].selected[o] + '+';
                
            }
        }

       

        $state.go('.',{
            columns  : columnParam
        })
       


    }

    $scope.tagEdit = function () {
        tagEditPanelService.showTagEditPanel(undefined, $scope.tags);
    }

    $scope.exists = function (id, columnName) {
        return columnTabPanelService.exists(id, columnName);
    }

    $scope.selectedTab = function () {
        columnTabPanelService.setSelectedTab($scope.activeTabIndex);
        $state.go('.', {
            activeRun: $scope.tabs[$scope.activeTabIndex].id
        })
    }

    $scope.selectedColumn = function (columnName) {
        $state.go('.', {
            activeColumn: columnName
        })
    }

    this.uiOnParamsChanged = function (params) {
       
        //activeRun
        if (params.hasOwnProperty('activeRun')) {
            for (var i = 0, n = $scope.tabs.length; i < n; i++) {
                if ($scope.tabs[i].id === params.activeRun) {
                    $scope.activeTabIndex = i;
                }
            }
        }

        //activeColumn
        if (params.hasOwnProperty('activeColumn')) {
            $log.log(params.activeColumn);
            columnTabPanelService.setActiveColumn(params.activeColumn);
        }

        //columns viewed
        if (params.hasOwnProperty('columns')) {
            var columnsSelected = params.columns.split('+');
            columnsSelected.pop();
            columnsSelected = (columnTabPanelService.parseUrlColumns(columnsSelected));
            columnTabPanelService.selectColumns(columnsSelected);
        }
    }



}])