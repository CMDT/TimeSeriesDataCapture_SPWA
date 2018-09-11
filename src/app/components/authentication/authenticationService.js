app.service('authenticationService', ['$log','authenticationNotifyService', function ($log,authenticationNotifyService) {
    var self = this;
    var lock = null;
    var options = {
        autoclose: true,
        auth: {
            responseType: "token id_token",
            redirect: false
        }
    }

    self.initialize = function () {

        if (lock == null) {

            lock = new Auth0Lock(
                '0XLhzBnfbBmbmKU6OnEan4CU5lLWkD81',
                'timeseriestest.eu.auth0.com',
                options
            );
        }
    }

    self.initialize();

    self.setSession = function (authResult) {
        var expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
        localStorage.setItem('accessToken', authResult.idToken);
        localStorage.setItem('expiresAt', expiresAt)
    }

    self.isAuthenticated = function(){
        var expiresAt = JSON.parse(localStorage.getItem('expiresAt'));
        return new Date().getTime() < expiresAt;
    }

    self.login = function () {
        lock.show();
    }

    self.logout = function(){
        localStorage.setItem('expiresAt',0);
    }

    lock.on('authenticated', function (authResult) {
        lock.getUserInfo(authResult.accessToken, function (error, profile) {
            if (error) {
                $log.error('authentication error');
                return;
            }

          

            localStorage.setItem('profile', profile.sub);
            self.setSession(authResult);
            authenticationNotifyService.publish('auth0')
            console.log(authResult.idToken);
        })
    })
}])

