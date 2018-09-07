app.controller('importPanelControllerV2', ['$scope', '$log', '$mdDialog','$filter', 'getFolderService', 'folderBreadcrumbService','algorithmsService','selectionService','fileStorageAuthenticationDataService','oneDriveAuthenticationService','authenticationNotifyService','timeSeriesGraphControlService','timeSeriesTrendService', function ($scope, $log, $mdDialog,$filter, getFolderService, folderBreadcrumbService,algorithmsService,selectionService,fileStorageAuthenticationDataService, oneDriveAuthenticationService,authenticationNotifyService,timeSeriesGraphControlService, timeSeriesTrendService) {

    var self = this;
    
    var algorithmMap = new Map();

    $scope.activePage = [];
    $scope.breadcrumb = [];
    $scope.preview = false;
    $scope.unauthorized = true;

   var selectionId = selectionService.addSelectionGroup('1','importSelection');
  
    var pathChange = function (component) {
        folderBreadcrumbService.navigate(component);
        $scope.breadcrumb = folderBreadcrumbService.getPath();
        getComponent();
    }

   

    var getComponent = function () {
        var component = $scope.breadcrumb[$scope.breadcrumb.length - 1];
        getFolderService.getComponent(component).then(function (result) {
            
            if (component.type === 'run') {
                timeSeriesGraphControlService.clearData();
                timeSeriesTrendService.clearTrends();
                var data = {
                    id : result.id,
                    runData : result.data,
                    annotations : []
                }

                var options = {
                    width: 1300,
                    height: 500,
                    state: false,
                    lock : false,
                    annotations: false,
                    margin:  {
                        top: 10,
                        right: 80,
                        bottom: 30,
                        left: 80
                    }
                }

                algorithmsService.getAllAlgorithms().then(function(result){
                    $log.log('ALGORITHMS')
                    $log.log(result);
                    $scope.activePage = result.data;
                    $log.log($scope.activePage)
                    $scope.$apply();
                })

                timeSeriesGraphControlService.drawGraph([data],options)
                timeSeriesGraphControlService.setActiveRun(result.id);
                timeSeriesGraphControlService.setActiveColumn('T(Copper)');
                timeSeriesGraphControlService.addTrend(result.id,'T(Copper)');

            }
            $log.log(result);
            $scope.activePage = result;
            $scope.unauthorized = false;
            $scope.$apply();
        }).catch(function(error){
            $scope.logout();
            $log.log(error);
            
        })
    }

    $scope.folderClick = function (component) {
        if (component.type === 'folder') {
            pathChange(component);
        }
    }

    $scope.previewToggle = function (component) {
        if ($scope.preview) {
            $scope.preview = false;
            pathChange($scope.breadcrumb[$scope.breadcrumb.length - 2]);
        } else {
            $scope.preview = true;
            pathChange(component);
        }
    }

    $scope.selectedToggle = function (runId) {
        selectionService.selectedToggle(selectionService.getSelectionGroup(selectionId),runId);
    }

    $scope.selectedAllToggle = function(){
        var components = $scope.activePage.data;
        if(!$scope.selectedAllIsChecked()){
            var runs = $filter('runFilter')(components);
            for(var i=0,n=runs.length;i<n;i++){
                selectionService.addSelected(selectionService.getSelectionGroup(selectionId),runs[i].id);
            }
        }else{
            for(var i=0,n=components.length;i<n;i++){
                selectionService.removeSelected(selectionService.getSelectionGroup(selectionId),components[i].id);
            }
        }
    }

    $scope.selectedAllIsChecked = function () {
        if(!($scope.activePage.hasOwnProperty('data'))){
            return false;
        }

        var components = $scope.activePage.data;
        var runs = $filter('runFilter')(components);
        var runsIds = $filter('componentIdFilter')(runs);
        return selectionService.isSelectedAll(selectionService.getSelectionGroup(selectionId),runsIds);
    }

   

    $scope.exists = function (runId) {
       return selectionService.isSelected(selectionService.getSelectionGroup(selectionId),runId);
    }

    $scope.cancel = function () {
        getFolderService.clearCache();
        $mdDialog.cancel();

    }

    $scope.confirm = function () {
        getFolderService.importRuns(selectionService.selectedToArray(selectionId));
        $scope.cancel();
    }

    $scope.login = function () {
        authenticationNotifyService.subscribe(callback);
        oneDriveAuthenticationService.login();
        
    }

    function callback(){
        init();
    }

    $scope.logout = function(){
        folderBreadcrumbService.home();
        getFolderService.clearCache();
        $scope.unauthorized = true;
        fileStorageAuthenticationDataService.deleteAuthentication();
    }

  

    var root = {
        id: '-1',
        name: 'root',
        type: 'folder'
    }

    function init(){
        var path = localStorage.getItem('path');
        getFolderService.setRootFolder(root.id);
        path = (path) ? JSON.parse(path) : [];
        $log.log(path);
        if (path != null && path.length > 0) {
            for (var i = 0, n = path.length; i < n; i++) {
                $log.log(path[i]);
                pathChange(path[i]);
            }
        } else {
            pathChange(root);
        }
    }

    init();


   
}])