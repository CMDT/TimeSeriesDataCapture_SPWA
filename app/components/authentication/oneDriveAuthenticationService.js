
app.service('oneDriveAuthenticationService', ['$rootScope', '$log', '$http', '$window', 'odauthService', 'fileStorageAuthenticationDataService', 'authenticationNotifyService','configDetails', function ($rootScope, $log, $http, $window, odauthService, fileStorageAuthenticationDataService, authenticationNotifyService,configDetails) {

    var self = this;


   

    $window.onAuthenticated = function (token, authWindow) {
        if (token) {
            if (authWindow) {
                removeLoginButton();
                authWindow.close();
            }

           
           self.setSession(token);
        }
    }

    self.setSession = function(token){
        var profileId = (localStorage.getItem('profile'));
        fileStorageAuthenticationDataService.postAuthentication({ profileID: profileId, storageToken: token }).then(function(result){
            var expiresAt = JSON.stringify(3600 * 1000 + new Date().getTime());
            localStorage.setItem('oneDriveExpiresAt',expiresAt);
            authenticationNotifyService.publishOneDrive();
        })
    }

    self.isAuthenticated = function(){
        var expiresAt = JSON.parse(localStorage.getItem('oneDriveExpiresAt'));
        return new Date().getTime() < expiresAt;
    }

    self.login = function login() {


        var appInfo = {
            "clientId": configDetails.ONEDRIVE_CLIENTID,
            "redirectUri": configDetails.ONEDRIVE_REDIRECTURI,
            "scopes": configDetails.ONEDRIVE_SCOPES,
            "authServiceUri": configDetails.ONEDRIVE_AUTHSERVICEURI
        }

        odauthService.provideAppInfo(appInfo);
        odauthService.challengeForAuth();
        return false;
    }

    self.logout= function logout(){
        localStorage.setItem('oneDriveExpiresAt',0);
    }







}])