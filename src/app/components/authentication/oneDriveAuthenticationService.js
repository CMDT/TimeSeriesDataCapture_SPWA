
app.service('oneDriveAuthenticationService',['$log','odauthService','$window',function($log,odauthService,$window){

    var appInfo = {
        "clientId": '1a67f6f4-db2a-4298-8cf8-72946ac50669',
        "redirectUri": "http://localhost:8080/callback.html",
        "scopes": "user.read",
        "authServiceUri": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    }

    $window.onAuthenticated = function(token,authWindow){
        if (token) {
            if (authWindow) {
              removeLoginButton();
              authWindow.close();
            }
        
            console.log('============OneDrive Token======================');
            console.log(token);
            console.log('=================================================');
          }
    }

    this.login = function login() {
  
        $log.log('logging into OneDrive');
        odauthService.provideAppInfo(appInfo);
        odauthService.challengeForAuth();
      
        return false;
    }



    

}])