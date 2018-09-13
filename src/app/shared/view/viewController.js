app.controller('viewController', ['$scope','$rootScope', '$log', '$state', '$stateParams', 'tagEditPanelService', 'columnTabPanelService', 'timeSeriesGraphControlService', 'timeSeriesTrendService', 'authenticationService', 'paletteDataService', function ($scope,$rootScope, $log, $state, $stateParams, tagEditPanelService, columnTabPanelService, timeSeriesGraphControlService, timeSeriesTrendService, authenticationService, paletteDataService) {


    $scope.runs = [];
    $scope.tabs = [];

    $scope.activeTabIndex;

    $scope.isColumns = true;

    var tagsArray = [];

    var tagsCollection = {};


    if ($stateParams.runs != undefined) {
        columnTabPanelService.getRun($stateParams.runs.split('+')).then(function (result) {
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
        })
    }

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

    $scope.selectedColumn = function (tabId, columnName) {

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
        
    }

    $scope.isActiveColumn = function (tabId, columnName) {
       
        var activeColumn = timeSeriesGraphControlService.getActiveColumn()

        if(activeColumn == undefined){
            return false;
        }

        activeColumn = activeColumn.split('+');

        if (tabId === activeColumn[0] && columnName === activeColumn[1]) {
        
            return true;
        } else {
            return false;
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
            timeSeriesGraphControlService.setActiveColumn(params.activeColumn);
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

        if(params.hasOwnProperty('activeRun')){
            timeSeriesGraphControlService.setActiveRun(params.activeRun);
            $log.log('TAGS ARRAY')
            tagsArray = tagsCollection[params.activeRun];
           
        }
    }



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









}])