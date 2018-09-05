
app.service('oneDriveAuthenticationService', ['$rootScope', '$log', '$http', '$window', 'odauthService','fileStorageAuthenticationDataService', function ($rootScope, $log, $http, $window, odauthService, fileStorageAuthenticationDataService) {

    var self = this;

    var appInfo = {
        "clientId": '1a67f6f4-db2a-4298-8cf8-72946ac50669',
        "redirectUri": "http://localhost:8080/callback.html",
        "scopes": "user.read",
        "authServiceUri": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    }

    $window.onAuthenticated = function (token, authWindow) {
        if (token) {
            if (authWindow) {
                removeLoginButton();
                authWindow.close();
            }

            $log.log(token);
            var profileId = (localStorage.getItem('profile'));
            fileStorageAuthenticationDataService.postAuthentication({ profileID: profileId, storageToken: token})
           
        }
    }

    self.login = function login() {

        $log.log('logging into OneDrive');
        odauthService.provideAppInfo(appInfo);
        odauthService.challengeForAuth();

       


        return false;
    }

    




}])