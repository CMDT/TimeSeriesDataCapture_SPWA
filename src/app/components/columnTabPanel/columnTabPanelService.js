app.service('columnTabPanelService', ['$log', 'runRequestService', 'selectionService', function ($log, runRequestService, selectionService) {

    var self = this;
    self.getRunData = function (runIdArray) {
        return new Promise(function (resolve, reject) {
            var getRunPromises = runIdArray.map(runRequestService.getRun);
            Promise.all(getRunPromises)
                .then(function (result) {
                    resolve(result);
                })
        })
    }

    self.getRun = function (runIdArray) {
        return new Promise(function (resolve, reject) {
            var results = [];
            self.getRunData(runIdArray).then(function (result) {
                for (var i = 0, n = result.length; i < n; i++) {
                    //get data
                    results.push(result[i].data);
                }
                resolve(results);
            })
        });
    }

    self.addRunSelectionGroup = function (runId, defaultColumn) {
        //create selection group for each id, add defaultColumn as selected
        selectionService.addSelectionGroup(runId);
        selectionService.selectedToggle(selectionService.getSelectionGroup(runId), defaultColumn);
    }

    self.selectedToggle = function (id, columnName) {
        var selection = selectionService.getSelectionGroup(id);
        if (selectionService.isSelected(selection, columnName)) {
            selectionService.removeSelected(selection, columnName);
            timeSeriesGraphService.deselectColumn(id, columnName);
        } else {
            selectionService.addSelected(selection, columnName);
            timeSeriesGraphService.selectedColumn(id, columnName);
        }
    }

    self.exists = function (id, columnName) {
        return selectionService.isSelected(selectionService.getSelectionGroup(id), columnName);
    }

    self.createRunTabs = function (runArray) {
        $log.log(runArray);
        var tabs = [];
        for (var i = 0, n = runArray.length; i < n; i++) {
            tabs.push(self.createRunTab(runArray[i].id,runArray[i].runData));
        }
        return tabs;
    }

    self.createRunTab = function (id,data) {
        self.addRunSelectionGroup(id,'RTH');
        var tabObject = {
            id: id,
            columns: []
        }
        //each object key is a column name
        var columnNames = Object.keys(data);
        tabObject.columns = columnNames;
        return tabObject;
    }






}])