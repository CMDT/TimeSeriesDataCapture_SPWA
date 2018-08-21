app.controller('importPanelControllerV2', ['$scope', '$log', '$mdDialog','$filter', 'getFolderService', 'folderBreadcrumbService','algorithmsService','selectionService', function ($scope, $log, $mdDialog,$filter, getFolderService, folderBreadcrumbService,algorithmsService,selectionService) {

    var self = this;
    var selectedMap = new Map();

    $scope.activePage = [];
    $scope.breadcrumb = [];
    $scope.preview = false;

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
                var r = result.data
                r['Time'] = r['Time'].slice(0, 10);
                r['Setpoint'] = r['T(Setpoint)'].slice(0, 10);
                r['Copper'] = r['T(Copper)'].slice(0, 10);
                r['Cell1'] = r['T(Cell1)'].slice(0, 10);
                r['Environment'] = r['T(Environment)'].slice(0, 10);
                r['DAC'] = r['DAC'].slice(0, 10);
                result.data = r;
            }
            $scope.activePage = result;
            $scope.$apply();
        });
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
            
            algorithmsService.getAllAlgorithms().then(function(result){
                $scope.activePage.algorithms = result.data;
                $scope.$apply();
            })
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

    var root = {
        id: '-1',
        name: 'root',
        type: 'folder'
    }


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
}])