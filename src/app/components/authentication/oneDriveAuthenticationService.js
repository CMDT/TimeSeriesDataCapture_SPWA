
app.service('oneDriveAuthenticationService', ['$rootScope', '$log', '$http', '$window', 'odauthService', 'fileStorageAuthenticationDataService', 'authenticationNotifyService', function ($rootScope, $log, $http, $window, odauthService, fileStorageAuthenticationDataService, authenticationNotifyService) {

    var self = this;

    var appInfo = client_config.ONEDRIVE_APPINFO;

    var logged = false;


    $window.onAuthenticated = function (token, authWindow) {
        if (token) {
            if (authWindow) {
                removeLoginButton();
                authWindow.close();
            }

            $log.log(token);
           
           self.setSession(token);
        }
    }

    self.setSession = function(token){
        var profileId = (localStorage.getItem('profile'));
        fileStorageAuthenticationDataService.postAuthentication({ profileID: profileId, storageToken: token }).then(function(result){
            var expiresAt = JSON.stringify(3600 * 1000 + new Date().getTime());
            localStorage.setItem('oneDriveExpiresAt',expiresAt);
            authenticationNotifyService.publish('oneDrive');
        })
    }

    self.isAuthenticated = function(){
        var expiresAt = JSON.parse(localStorage.getItem('oneDriveExpiresAt'));
        return new Date().getTime() < expiresAt;
    }

    self.login = function login() {
        odauthService.provideAppInfo(appInfo);
        odauthService.challengeForAuth();
        return false;
    }

    self.logout= function logout(){
        localStorage.setItem('oneDriveExpiresAt',0);
    }







}])