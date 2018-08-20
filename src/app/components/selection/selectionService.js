app.service('selectionService', ['$log', function ($log) {

    var self = this;

    var selectionMap = new Map();

    self.selectedToggle = function(id,value){
        if(self.isSelected(id)){
            self.removeSelected(id);
        }else{
            self.addSelected(id,value);
        }
    }

    self.isSelectedAll = function(idList){
        for(var i=0,n=idList.length;i<n;i++){
            if(!(self.isSelected(idList[i]))){
                return false;
            }
        }

        return true;
    }

    self.addSelected = function(id,value){
        selectionMap.set(id,value);
    }

    self.removeSelected = function(id){
        selectionMap.delete(id);
    }

    self.isSelected = function(id){
        if(selectionMap.get(id) != undefined){
            return true;
        }

        return false;
    }

    self.selectedToArray = function(){
        var selectedArray = [];

        selectionMap.forEach(selected => {
            selectedArray.push(selected);
        });

        return selectedArray;
    }









}])