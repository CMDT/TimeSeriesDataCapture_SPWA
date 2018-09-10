
app.service('oneDriveAuthenticationService', ['$rootScope', '$log', '$http', '$window', 'odauthService', 'fileStorageAuthenticationDataService', 'authenticationNotifyService', function ($rootScope, $log, $http, $window, odauthService, fileStorageAuthenticationDataService, authenticationNotifyService) {

    var self = this;

    var appInfo = {
        "clientId": '1a67f6f4-db2a-4298-8cf8-72946ac50669',
        "redirectUri": "https://timeseriesdatacapture-spwa.herokuapp.com/callback.html",
        "scopes": "user.read",
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
            var profileId = (localStorage.getItem('profile'));
            fileStorageAuthenticationDataService.postAuthentication({ profileID: profileId, storageToken: token }).then(function(result){
                authenticationNotifyService.publish();
            })
           
        }
    }

    self.login = function login() {
        odauthService.provideAppInfo(appInfo);
        odauthService.challengeForAuth();
        return false;
    }







}])