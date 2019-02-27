app.controller('viewController', ['$scope','$rootScope', '$log', '$state', '$stateParams', 'tagEditPanelService', 'columnTabPanelService', 'timeSeriesGraphControlService', 'timeSeriesTrendService', 'authenticationService', 'paletteDataService','runRequestService','timeSeriesGraphServiceV2','activeColumn', function ($scope,$rootScope, $log, $state, $stateParams, tagEditPanelService, columnTabPanelService, timeSeriesGraphControlService, timeSeriesTrendService, authenticationService, paletteDataService,runRequestService,timeSeriesGraphServiceV2,activeColumn) {


    $scope.runs = [];
    $scope.tabs = [];

    $scope.activeTabIndex;

    $scope.isColumns = true;

    var tagsArray = [];

    var tagsCollection = {};

    $scope.query = $rootScope.query;


    if ($stateParams.runs) {
        // TODO : need to test getRunV2 
        var runs = $stateParams.runs.split('+');
       
        
        
    
        runRequestService.getRuns(runs).then(function(result){
          
            result = extractData(result);
            console.log(result);

            timeSeriesGraphServiceV2.graphInit(result,{});
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
                activeColumn.column = $stateParams.activeColumn;
            }

            var offsetVector;
            var viewVector;
            if ($stateParams.offsetVector != undefined) {
                offsetVector = JSON.parse($stateParams.offsetVector);
            }

            if ($stateParams.viewVector != undefined) {
                viewVector = JSON.parse($stateParams.viewVector);
            }

            timeSeriesGraphServiceV2.transition(viewVector,offsetVector);

            $scope.$apply();
        })


        /* columnTabPanelService.getRun($stateParams.runs.split('+')).then(function (result) {
            columnTabPanelService.clearSelection();
            timeSeriesGraphControlService.clearData();
            timeSeriesTrendService.clearTrends();

            tagsCollection = (extractTags(result));

            $scope.runs = result;
            columnTabPanelService.createRunTabs(result);
            $scope.tabs = columnTabPanelService.getTabs();

            var palette = $stateParams.palette != undefined ? $stateParams.palette : 'default';
            paletteDataService.getPalette(palette).then(function (paletteResult) {
                $log.log(paletteResult.data.palette);
                var options = {
                    state: true,
                    width: 1300,
                    height: 600,
                    lock: true,
                    annotation: true,
                    palette: paletteResult.data.palette
                }



                timeSeriesGraphControlService.drawGraph(result, options);

                if ($stateParams.activeColumn != undefined) {
                    $log.log('ACTIVE COLUMN',$stateParams.activeColumn);
                    timeSeriesGraphControlService.setActiveColumn($stateParams.activeColumn);
                }

                if($stateParams.activeRun != undefined){
                    timeSeriesGraphControlService.setActiveRun($stateParams.activeRun);
                    tagsArray = tagsCollection[$stateParams.activeRun];
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
                //$scope.$apply();
            });




        }).catch(function (error) {
            $log.log(error);
        }) */
    }

    /* $scope.selectedColumn = function (tabId, columnName) {
        console.log('activeRun',tabId)
        $state.go('.', {
            activeColumn: tabId + '+' + columnName
        })
    }

    $scope.selectedTab = function () {
        
        var runId = ($scope.tabs[$scope.activeTabIndex]).id;
        $log.log(runId);
        $state.go('.', {
            activeRun: runId 
        })
        
    } */

    $scope.back = function(){
        var options = {
            location: 'replace',
            inherit: false,
        }

        $state.transitionTo('home',{
            query:$rootScope.query
        },options);
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
        tagEditPanelService.showTagEditPanel(undefined, runId, tagsArray);
    }

    $scope.exists = function (id, columnName) {
        return columnTabPanelService.exists(id, columnName);
    }

    $scope.activeRunClick = function(tabId,columnName){
        $state.go('.',{
            activeColumn : `${tabId}+${columnName}`
        })
    }

    

  

    

    $scope.isActiveColumn = function (tabId, columnName) {
        if(activeColumn.column){
            var active = activeColumn.column.split("+");
            if (tabId === active[0] && columnName === active[1]) {
                return true;
            } else {
                return false;
            }
        }
    }

    $scope.isAuthenticated = function () {
        return authenticationService.isAuthenticated();
    }

    $scope.tags = function(){
        return tagsArray;
    }


    this.uiOnParamsChanged = function (params) {
        //active selection

        if (params.hasOwnProperty('activeColumn')) {
            activeColumn.column = params.activeColumn;
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

    function extractData(runArray){
        var results = [];
        for (var i = 0, n = runArray.length; i < n; i++) {
            //get data
            results.push(runArray[i].data);
        }

        return results;
    }









}])