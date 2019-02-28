angular.module('app').controller('viewController', viewController);

viewController.$inject = [
    '$scope',
    '$rootScope',
    '$log',
    '$state',
    '$stateParams',
    'tagEditPanelService',
    'columnTabPanelService',
    'timeSeriesTrendService',
    'authenticationService',
    'timeSeriesGraphServiceV2',
    'activeColumn',
    'timeSeriesAnnotationService',
    'runData'
]

function viewController($scope, 
    $rootScope, 
    $log, $state, 
    $stateParams, 
    tagEditPanelService, 
    columnTabPanelService, 
    timeSeriesTrendService, 
    authenticationService, 
    timeSeriesGraphServiceV2, 
    activeColumn, 
    timeSeriesAnnotationService, 
    runData) 
    
    {
    $scope.runs = [];
    $scope.tabs = [];

    $scope.activeTabIndex;

    $scope.isColumns = true;

    $scope.query = $rootScope.query;
    
    //functions
    $scope.back = back;

    $scope.selectedToggle = selectedToggle;

    $scope.tagEdit = tagEdit;

    $scope.exists = exists;
    $scope.activeRunClick = activeRunClick;
    $scope.isActiveColumn = isActiveColumn;

    $scope.isAuthenticated = isAuthenticated;

    var tagsArray = [];
    var tagsCollection = {};


    if (runData) {
        // TODO : need to test getRunV2 
        result = extractData(runData);
        console.log(result);

        timeSeriesAnnotationService.extractAnnotations(result);

        timeSeriesGraphServiceV2.graphInit(result, {});
        columnTabPanelService.clearSelection();

        timeSeriesTrendService.clearTrends();

        tagsCollection = (extractTags(result));

        columnTabPanelService.createRunTabs(result);
        $scope.tabs = columnTabPanelService.getTabs();


        if ($stateParams.columns) {
            var columns = columnTabPanelService.parseUrlColumns($stateParams.columns);
            columnTabPanelService.selectColumns(columns);
        }

        if ($stateParams.activeColumn) {
            setActiveColumn($stateParams.activeColumn);
        }

        var offsetVector;
        var viewVector;
        if ($stateParams.offsetVector != undefined) {
            offsetVector = JSON.parse($stateParams.offsetVector);
        }

        if ($stateParams.viewVector != undefined) {
            viewVector = JSON.parse($stateParams.viewVector);
        }

        timeSeriesGraphServiceV2.transition(viewVector, offsetVector);
    }




    function back () {
        var options = {
            location: 'replace',
            inherit: false,
        }

        $state.transitionTo('index', {
            query: $rootScope.query
        }, options);
    }

    function selectedToggle (runId, columnName) {
        if (!activeColumn.isActive(runId, columnName)) {
            var selectedColumns = columnTabPanelService.getSelectedColumns(runId, columnName);
            var columnParam = columnTabPanelService.parseColumnsUrl(selectedColumns);
            $log.log('columParam', columnParam);
            $state.go('.', {
                columns: columnParam
            })
        }
    }

    function tagEdit() {
        var runId = ($scope.tabs[$scope.activeTabIndex]).id;
        $log.log(runId)
        tagEditPanelService.showTagEditPanel(undefined, runId, tagsArray);
    }
    

    function exists(id, columnName) {
        return columnTabPanelService.exists(id, columnName);
    }

    function activeRunClick(tabId, columnName) {
        if (columnTabPanelService.exists(tabId, columnName)) {
            $state.go('.', {
                activeColumn: `${tabId}+${columnName}`
            })
        }
    }


    function isActiveColumn(runId, columnName) {
        return activeColumn.isActive(runId, columnName);
    }

    function isAuthenticated() {
        return authenticationService.isAuthenticated();
    }

    $scope.tags = function () {
        return tagsArray;
    }


    this.uiOnParamsChanged = function (params) {
        //active selection

        if (params.hasOwnProperty('activeColumn')) {
            setActiveColumn(params.activeColumn);
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

    function setActiveColumn(runColumn) {
        var active = runColumn.split('+');
        activeColumn.setRun(active[0]);
        activeColumn.setColumn(active[1]);
    }


    // TODO : these functions have been moved to a service (extractTagsService)
    // needs testing
    function extractTags(runArray) {
        var tagsCollection = {};
        for (var i = 0, n = runArray.length; i < n; i++) {
            tagsCollection[runArray[i].id] = parseTags(runArray[i].tags);
        }

        return tagsCollection;
    }

    function parseTags(tagObject) {
        var tags = [];
        var tagIds = Object.keys(tagObject);

        for (var i = 0, n = tagIds.length; i < n; i++) {
            tags.push({
                id: tagIds[i],
                tag: tagObject[tagIds[i]]
            })
        }

        return tags;
    }

    function extractData(runArray) {
        var results = [];
        for (var i = 0, n = runArray.length; i < n; i++) {
            //get data
            results.push(runArray[i].data);
        }

        return results;
    }

}

