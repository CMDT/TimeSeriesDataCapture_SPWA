app.service('selectionService', ['$log', function ($log) {

    var self = this;

    var selectionGroups = new Map();

    function selectionGroup(id,name,selected = new Map()){
        this.id=id;
        this.name=name;
        this.selected=selected;
    }

    self.addSelectionGroup = function(id,name){
        var newSelectionGroup = new selectionGroup(id,name,undefined);
        selectionGroups.set(id,newSelectionGroup);
        return id;
    }

    self.getSelectionGroup = function(id){
        return selectionGroups.get(id).selected;
    }
    
    self.removeSelectionGroup = function(selectionGroupId){
        selectionGroups.delete(selectionGroupId);
    }
    

    self.selectedToggle = function(selection,id){
        if(self.isSelected(selection,id)){
            self.removeSelected(selection,id);
        }else{
            self.addSelected(selection,id);
        }
    }

   
    self.isSelectedAll = function(selection,idList){
        for(var i=0,n=idList.length;i<n;i++){
            if(!(self.isSelected(selection,idList[i]))){
                return false;
            }
        }

        return true;
    }

    self.addSelected = function(selection,id){
        selection.set(id);
    }

    self.removeSelected = function(selection,id){
        selection.delete(id);
    }

    self.isSelected = function(selection,id){
        if(selection.has(id)){
            return true;
        }
        return false;
    }

    self.clearSelection = function(id){
        var t = selectionGroups.get(id).selected;
        t.clear();

    }

    self.clearAllSelections = function(){
        selectionGroups = new Map();
    }

    self.getGroupIds = function(){
        var groups = [];
        selectionGroups.forEach(function(value,id){
            groups.push(id);
        })

        return groups;
    }



    self.selectedToArray = function(selectionGroupId){
        var selection = selectionGroups.get(selectionGroupId);
        if(selection == undefined){
            return undefined;
        }

        selection = selection.selected
        var selectedArray = [];

      

        selection.forEach(function(value,id){
            selectedArray.push(id);
        })

        return selectedArray;
    }









}])