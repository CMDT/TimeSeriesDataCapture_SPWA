angular.module('app').service('activeColumn', activeColumn);

activeColumn.$inject = [
];


function activeColumn() {
    var self = this;

    var column = undefined;
    var run = undefined

    self.getColumn = getColumn;
    self.getRun = getRun

    self.setColumn = setColumn;
    self.setRun = setRun;

    self.isActive = isActive;

    function getColumn(){
        return column;
    }

    function getRun(){
        return run;
    }

    function setColumn(columnName){
        column = columnName;
    }

    function setRun(runId){
        run = runId;
    }

    function isActive(runId,columnName){
        return (run === runId && column === columnName);
    }

}