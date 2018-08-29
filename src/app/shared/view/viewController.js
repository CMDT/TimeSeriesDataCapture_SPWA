app.controller('viewController', ['$scope', '$log', '$state', '$stateParams', '$location', 'tagEditPanelService', 'columnTabPanelService', 'timeSeriesGraphControlService', function ($scope, $log, $state, $stateParams, $location, tagEditPanelService, columnTabPanelService, timeSeriesGraphControlService) {


    $scope.runs = [];
    $scope.tabs = [];

    $scope.activeTabIndex;

    $scope.isColumns = true;

    $scope.tags = ['tag1', 'tag2', 'tag3'];

    columnTabPanelService.getRun(['2B497C4DAFF48A9C!160', '2B497C4DAFF48A9C!178']).then(function (result) {
        $scope.runs = result;
        columnTabPanelService.createRunTabs(result);
        $scope.tabs = columnTabPanelService.getTabs();

        if ($stateParams.columns != undefined) {
            var columns = columnTabPanelService.parseUrlColumns($stateParams.columns);
            columnTabPanelService.selectColumns(columns);

        }

        $scope.$apply();

        timeSeriesGraphControlService.drawGraph(result);
    })

    $scope.selectedToggle = function (id, columnName) {
        var selectedColumns = columnTabPanelService.getSelectedColumns(id, columnName);
        var columnParam = columnTabPanelService.parseColumnsUrl(selectedColumns);
        $log.log('columParam', columnParam);
        $state.go('.', {
            columns: columnParam
        })
    }

    $scope.tagEdit = function () {
        tagEditPanelService.showTagEditPanel(undefined, $scope.tags);
    }

    $scope.exists = function (id, columnName) {
        return columnTabPanelService.exists(id, columnName);
    }

    $scope.selectedTab = function () {
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
        $log.log(params);
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
            if (params.columns != undefined) {
                columnsSelected = (columnTabPanelService.parseUrlColumns(params.columns));
                columnTabPanelService.selectColumns(columnsSelected);
            } else {
                columnTabPanelService.selectColumns([]);
            }
        }
    }







}])