app.service('columnTabPanelService', ['$log', 'runRequestService', 'selectionService', function ($log, runRequestService, selectionService) {

    var self = this;
    var selectedTab;
    var activeColumn;
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



    self.selectedToggle = function (selectionGroupId, columnNames) {
        var selection = selectionService.getSelectionGroup(selectionGroupId);
        var selected = selectionService.selectedToArray(selectionGroupId);

        for (var i = 0, n = selected.length; i < n; i++) {
            //remove from selection
            if (!(columnNames.includes(selected[i]))) {
                selectionService.removeSelected(selection, selection[i]);
            }
        }

        for (var i = 0, n = columnNames.length; i < n; i++) {
            //add to selection
            if (!(selected.includes(columnNames[i]))) {
                selectionService.addSelected(selection, columnNames[i]);
            }
        }
    }

    self.exists = function (id, columnName) {
        return selectionService.isSelected(selectionService.getSelectionGroup(id), columnName);
    }

    self.createRunTabs = function (runArray) {
        $log.log(runArray);
        var tabs = [];
        for (var i = 0, n = runArray.length; i < n; i++) {
            tabs.push(self.createRunTab(runArray[i].id, runArray[i].runData));
        }
        return tabs;
    }

    self.createRunTab = function (id, data) {
        self.addRunSelectionGroup(id, 'RTH');
        var tabObject = {
            id: id,
            columns: []
        }
        //each object key is a column name
        var columnNames = Object.keys(data);
        tabObject.columns = columnNames;
        return tabObject;
    }

    self.setSelectedTab = function (id) {
        selectedTab = id;
    }

    self.setActiveColumn = function (columnName) {
        activeColumn = columnName;
    }

    self.getSelected = function (selectionGroupId){
        return selectionService.selectedToArray(selectionGroupId);
    }

    self.allColumnsSelected = function(selectionGroupIds){
        var selectionArray = [];
        for(var i=0,n=selectionGroupIds.length;i<n;i++){
            var selected = selectionService.selectedToArray(selectionGroupIds[i])
            selectionArray.push({
                selectionGroup: selectionGroupIds[i],
                selected: selected
            });
        }

        return selectionArray
    }

    self.columnSelectToggle = function(id,columnName){
        var selectionGroupIds = selectionService.getGroupIds();
        var selectedColumns = self.allColumnsSelected(selectionGroupIds);

        for (var i = 0, n = selectedColumns.length; i < n; i++) {
       
            if (selectedColumns[i].selectionGroup == id) {
                
                var selected = selectedColumns[i].selected;
                var found = false;
                for(var o=0,m=selected.length;o<m;o++){
                    if(selected[o] == columnName){
                        selected.splice(o,1);
                        found = true;
                        break;
                    }
                }

                if(!found){
                    selected.push(columnName);
                }
            }
        }

        return selectedColumns;
    }

    self.parseUrlColumns = function (columns){
        
        var columnGroup = new Map();

        $log.log(columns);

        for(var i=0,n=columns.length;i<n;i++){
            var column = columns[i].split(':');
            if(columnGroup.has(column[0])){
                columnGroup.get(column[0]).push(column[1]);
            }else{
                columnGroup.set(column[0],[column[1]]);
            }
        }

        var columnGroupArray = [];

        columnGroup.forEach(function(value,id){
            columnGroupArray.push({
                selectionGroup : id,
                selected: value
            })
        })

        return columnGroupArray;
    }

    self.selectColumns = function (columns){
        for(var i=0,n=columns.length;i<n;i++){
            var selection = selectionService.selectedToArray(columns[i].selectionGroup);
           
            //newley selected columns
            for(var o=0,m=columns[i].selected.length;o<m;o++){
                if(!selection.includes(columns[i].selected[o])){
                    selectionService.addSelected(selectionService.getSelectionGroup(columns[i].selectionGroup),columns[i].selected[o]);
                    $log.log('add selection',columns[i].selected[o]);
                }
            }

            for(var o=0,m=selection.length;o<m;o++){
                if(!(columns[i].selected.includes(selection[o]))){
                    //remove selection
                    selectionService.removeSelected(selectionService.getSelectionGroup(columns[i].selectionGroup),selection[o]);
                    $log.log('remove selection',selection[o]);
                }
            }
        }

        $log.log(selectionService.selectedToArray('2B497C4DAFF48A9C!160'));
    }






}])