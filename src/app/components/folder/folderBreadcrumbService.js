app.service('folderBreadcrumbService', ['$log', function ($log) {

    var self = this;

    var path = [];

    self.navigate = function (folderObject) {
        if(self.backTo(folderObject)){
            return;
        }
        path.push(folderObject);
    }

    self.backTo = function (folderObject) {
        for (var i = 0, n = path.length; i < n; i++) {
            if (folderObject.id === path[i].id) {
                for(var j=path.length-1;j>i;j--){
                    path.pop();
                }
                return true
            }
        }
    }

    self.home = function () {
        path = [];
    }

    
    self.getPath = function(){
        return path;
    }

}])