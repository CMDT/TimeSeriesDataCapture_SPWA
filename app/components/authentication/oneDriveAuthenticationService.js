angular.module('app').service('oneDriveAuthenticationService', oneDriveAuthenticationService)

oneDriveAuthenticationService.$inject = [
    '$window',
    'odauthService',
    'fileStorageAuthenticationDataService',
    'authenticationNotifyService',
]

function oneDriveAuthenticationService(
    $window,
    odauthService,
    fileStorageAuthenticationDataService,
    authenticationNotifyService,
) {

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

    self.setSession = function (token) {
        var profileId = (localStorage.getItem('profile'));
        fileStorageAuthenticationDataService.postAuthentication({ profileID: profileId, storageToken: token }).then(function (result) {
            var expiresAt = JSON.stringify(3600 * 1000 + new Date().getTime());
            localStorage.setItem('oneDriveExpiresAt', expiresAt);
            authenticationNotifyService.publishOneDrive();
        })
    }

    self.isAuthenticated = function () {
        var expiresAt = JSON.parse(localStorage.getItem('oneDriveExpiresAt'));
        return new Date().getTime() < expiresAt;
    }

    self.login = function login() {


        var appInfo = {
            "clientId": CONFIG.ONEDRIVE_CLIENTID,
            "redirectUri": CONFIG.ONEDRIVE_REDIRECTURI,
            "scopes": CONFIG.ONEDRIVE_SCOPES,
            "authServiceUri": CONFIG.ONEDRIVE_AUTHSERVICEURI
        }

        odauthService.provideAppInfo(appInfo);
        odauthService.challengeForAuth();
        return false;
    }

    self.logout = function logout() {
        localStorage.setItem('oneDriveExpiresAt', 0);
    }

}