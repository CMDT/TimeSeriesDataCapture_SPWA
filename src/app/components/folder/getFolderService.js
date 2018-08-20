app.service('getFolderService', ['$log', 'folderBrowserService', 'runRequestService', 'componentIdsService','oneDriveAuthenticationService', function ($log, folderBrowserService, runRequestService, componentIdsService,oneDriveAuthenticationService) {

    var self = this;
    var rootFolderId;


    self.setRootFolder = function (folderId) {
        rootFolderId = folderId
    }



    self.getComponent = function (componentObject){
        return new Promise(function(resolve,reject){
            var component = self.getComponentCacheById(componentObject.id);
            if(component != undefined){
                return resolve(component);
            }

            var id = componentObject.id;
            if(componentObject.type === 'folder'){
                if(rootFolderId == componentObject.id){
                    id = undefined;
                }
            }

            self.getComponentFromServer(id,componentObject.type).then(function(result){
                var data = result
                if(componentObject.type === 'run'){
                    data = result.data;
                }else if(componentObject.type === 'folder'){
                    data = result.data.folders;
                }
                
                var newFolder = self.newFolder(componentObject.id,componentObject.name,data);
                $log.log(newFolder);
                return resolve(newFolder);
            }).catch(function(error){
                if(error === 'fileStorageUnAuthenticated'){
                    oneDriveAuthenticationService.login();
                }
            })
        })
    }

    self.getComponentCacheById = function (componentId) {
        return folderBrowserService.getFolder(componentId);
    }

    self.getComponentFromServer = function (componentId, type) {
        return new Promise(function (resolve, reject) {
            if (type === 'folder') {
                componentIdsService.getComponentIds(componentId).then(function (result) {
                    return resolve(result);
                }).catch(function(error){
                    reject(error);
                })
            }

            if (type === 'run') {
                runRequestService.getRunPreview(componentId).then(function (result) {
                    return resolve(result);
                }).catch(function(error){
                    reject(error);
                })
            }
        });
    }

    self.checkCache = function (folderId) {
        var folder = folderBrowserService.getFolder(folderId);
        if (folder != undefined) {
            return (folder);
        } else {
            return (undefined);
        }
    }

    self.clearCache = function () {
        rootFolderId = undefined;
        folderBrowserService.clearCache();
    }

    self.importRuns = function(runs){
        componentIdsService.postComponentIds(runs).then(function(result){
            $log.log(result);
        })
    }

    self.newFolder = function (folderId, folderName, data, parentId) {
        var newFolderId = folderBrowserService.createFolder(folderId, folderName, data);

        if (parentId != undefined) {
            folderBrowserService.addChildren(parentId, [newFolderId]);
        }

        return folderBrowserService.getFolder(newFolderId);
    }






}])