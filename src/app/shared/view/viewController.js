app.controller('viewController', ['$scope', '$log', '$state', '$stateParams', '$transitions', 'tagEditPanelService', 'columnTabPanelService', 'timeSeriesGraphControlService','timeSeriesTrendService','tagPredictionService', function ($scope, $log, $state, $stateParams, $transitions, tagEditPanelService, columnTabPanelService, timeSeriesGraphControlService, timeSeriesTrendService,tagPredictionService) {


    $scope.runs = [];
    $scope.tabs = [];

    $scope.activeTabIndex;

    $scope.isColumns = true;

    $scope.tags = [];

    var tagsCollection = {

    }


    if ($stateParams.runs != undefined) {
        columnTabPanelService.getRun($stateParams.runs.split('+')).then(function (result) {
            columnTabPanelService.clearSelection();
            timeSeriesGraphControlService.clearData();
            timeSeriesTrendService.clearTrends();

            tagsCollection = (extractTags(result));
         
           

            $scope.runs = result;
            columnTabPanelService.createRunTabs(result);
            $scope.tabs = columnTabPanelService.getTabs();
            timeSeriesGraphControlService.drawGraph(result);
           
            if ($stateParams.active != undefined) {
                var active = $stateParams.active.split('+');
                timeSeriesGraphControlService.setActiveRun(active[0]);
                timeSeriesGraphControlService.setActiveColumn(active[1]);
            }


            if ($stateParams.columns != undefined) {
                var columns = columnTabPanelService.parseUrlColumns($stateParams.columns);
                columnTabPanelService.selectColumns(columns);
            }

            

            var offsetVector;
            var viewVector;
            if ($stateParams.offsetVector != undefined) {
                offsetVector = JSON.parse($stateParams.offsetVector);
            }

            if ($stateParams.viewVector != undefined) {
                viewVector = JSON.parse($stateParams.viewVector);
            }
            timeSeriesGraphControlService.graphTransition(viewVector, offsetVector);

            $scope.selectedTab();
            $scope.$apply();


        }).catch(function(error){
            $log.log(error);
        })
    }


    $scope.selectedToggle = function (id, columnName) {
        var selectedColumns = columnTabPanelService.getSelectedColumns(id, columnName);
        var columnParam = columnTabPanelService.parseColumnsUrl(selectedColumns);
        $log.log('columParam', columnParam);
        $state.go('.', {
            columns: columnParam
        })
    }

    $scope.tagEdit = function () {
        var runId = ($scope.tabs[$scope.activeTabIndex]).id;
        $log.log(runId)
        tagEditPanelService.showTagEditPanel(undefined,runId,$scope.tags);
    }

    $scope.exists = function (id, columnName) {
        return columnTabPanelService.exists(id, columnName);
    }

    $scope.selectedColumn = function (tabId, columnName) {

        $state.go('.', {
            active: tabId + '+' + columnName
        })
    }

    $scope.selectedTab = function(){
        var runId = ($scope.tabs[$scope.activeTabIndex]).id;
        $log.log(tagsCollection);
        $scope.tags = tagsCollection[runId];
    }

    $scope.isActiveColumn = function(tabId,columnName){
        activeTab = timeSeriesGraphControlService.getActiveRun();
        activeColumn = timeSeriesGraphControlService.getActiveColumn();

        if(tabId === activeTab && activeColumn === columnName){
            return true;
        }else{
            return false;
        }
    }

    this.uiOnParamsChanged = function (params) {
        //active selection

        if (params.hasOwnProperty('active')) {
            var active = params.active.split('+');
            timeSeriesGraphControlService.setActiveRun(active[0]);
            timeSeriesGraphControlService.setActiveColumn(active[1]);
         
            $scope.tags = tagsCollection[active[0]];
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

    

    function extractTags(runArray){
        var tagsCollection = {};
       for(var i=0, n= runArray.length;i<n;i++){
           tagsCollection[runArray[i].id] = parseTags(runArray[i].tags);
       }

       return tagsCollection;
    }

    function parseTags(tagObject){
        var tags = [];
        var tagIds = Object.keys(tagObject);

        for(var i=0,n=tagIds.length;i<n;i++){
            tags.push({
                id : tagIds[i],
                tag : tagObject[tagIds[i]]
            })
        }

        return tags;
    }


 






}])