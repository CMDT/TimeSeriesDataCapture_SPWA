app.service('columnTabPanelService', ['$log', 'runRequestService', 'selectionService','timeSeriesGraphControlService', function ($log, runRequestService, selectionService, timeSeriesGraphControlService) {

    var self = this;
    var tabs = new Map();
    var selectedTab;
    var activeColumn;
    self.getRunData = function (runIdArray) {
        return new Promise(function (resolve, reject) {
            var getRunPromises = runIdArray.map(runRequestService.getRun);
            Promise.all(getRunPromises)
                .then(function (result) {
                    resolve(result);
                })
                .catch(function(error){
                    reject(error);
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
            }).catch(function(error){
                reject(error);
            })
        });
    }


    self.exists = function (id, columnName) {
        return selectionService.isSelected(selectionService.getSelectionGroup(id), columnName);
    }

    self.createRunTabs = function (runArray){
        for(var i=0, n=runArray.length;i<n;i++){
            self.createRunTab(runArray[i].id, runArray[i].runData);
        }
    }

    self.createRunTab = function (id, data){
        selectionService.addSelectionGroup(id);
        var tabObject = {
            id: id,
            columns : []
        }
        var columnNames = Object.keys(data);
        tabObject.columns = columnNames;
        tabs.set(id,tabObject);
    }

    self.getTabs = function (){
        var tabsArray = [];
        tabs.forEach(function(value,id){
            tabsArray.push(value);
        })
        return tabsArray;
    }

    self.getTab = function(id){
        return tabs.get(id);
    }
    

    self.getSelectedGroupColumns = function (selectionGroupIds) {
        var selectionArray = [];
        for (var i = 0, n = selectionGroupIds.length; i < n; i++) {
            var selected = selectionService.selectedToArray(selectionGroupIds[i])
            selectionArray.push({
                selectionGroup: selectionGroupIds[i],
                selected: selected
            });
        }

        return selectionArray
    }

    self.getSelectedColumns = function (id, columnName) {
        var selectionGroupIds = selectionService.getGroupIds();
        var selectedColumns = self.getSelectedGroupColumns(selectionGroupIds);

        for (var i = 0, n = selectedColumns.length; i < n; i++) {

            if (selectedColumns[i].selectionGroup == id) {

                var selected = selectedColumns[i].selected;
                var found = false;
                for (var o = 0, m = selected.length; o < m; o++) {
                    if (selected[o] == columnName) {
                        selected.splice(o, 1);
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    selected.push(columnName);
                }
            }
        }

        return selectedColumns;
    }

    self.parseUrlColumns = function (columns) {
        columns = columns.split('+');
        var columnGroup = new Map();

        $log.log(columns);

        for (var i = 0, n = columns.length; i < n; i++) {
            var column = columns[i].split(':');
            if (columnGroup.has(column[0])) {
                columnGroup.get(column[0]).push(column[1]);
            } else {
                columnGroup.set(column[0], [column[1]]);
            }
        }

        var columnGroupArray = [];

        columnGroup.forEach(function (value, id) {
            columnGroupArray.push({
                selectionGroup: id,
                selected: value
            })
        })

        return columnGroupArray;
    }

    self.parseColumnsUrl = function (columns) {
        var columnParam = '';
        for (var i = 0, n = columns.length; i < n; i++) {
            var id = columns[i].selectionGroup;
            for (o = 0, m = columns[i].selected.length; o < m; o++) {
                columnParam += id + ':' + columns[i].selected[o] + '+';

            }
        }

        return columnParam.slice(0,-1);
    }

    self.selectColumns = function (columns) {
        var columnIds = [];
        for(var i=0, n= columns.length; i<n;i++){
            columnIds.push(columns[i].selectionGroup);
        }

        var diff = selectionService.getGroupIds().filter(x => !columnIds.includes(x));
        
        for(var i=0,n=diff.length;i<n;i++){
            columns.push({
                selectionGroup : diff[i],
                selected: []
            })
        }


        for (var i = 0, n = columns.length; i < n; i++) {
            var selection = selectionService.selectedToArray(columns[i].selectionGroup);

            //newley selected columns
            for (var o = 0, m = columns[i].selected.length; o < m; o++) {
                if (!selection.includes(columns[i].selected[o])) {
                    selectionService.addSelected(selectionService.getSelectionGroup(columns[i].selectionGroup), columns[i].selected[o]);
                    $log.log('add selection', columns[i].selected[o]);
                    timeSeriesGraphControlService.addTrend(columns[i].selectionGroup,columns[i].selected[o]);
                }
            }

            //deselected columns
            for (var o = 0, m = selection.length; o < m; o++) {
                if (!(columns[i].selected.includes(selection[o]))) {
                    selectionService.removeSelected(selectionService.getSelectionGroup(columns[i].selectionGroup), selection[o]);
                    $log.log('remove selection', selection[o]);
                    timeSeriesGraphControlService.removeTrend(columns[i].selectionGroup,selection[o])
                }
            }
        }
    }

    self.clearSelection = function (selectionGroupIds){
        selectionService.clearSelection(selectionGroupIds);
    }






}])