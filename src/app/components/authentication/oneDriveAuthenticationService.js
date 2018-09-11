
app.service('oneDriveAuthenticationService', ['$rootScope', '$log', '$http', '$window', 'odauthService', 'fileStorageAuthenticationDataService', 'authenticationNotifyService', function ($rootScope, $log, $http, $window, odauthService, fileStorageAuthenticationDataService, authenticationNotifyService) {

    var self = this;

    var appInfo = {
        "clientId": '1a67f6f4-db2a-4298-8cf8-72946ac50669',
        "redirectUri": "http://localhost:8080/callback.html",
        "scopes": "sites.read.all",
        "authServiceUri": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    }

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