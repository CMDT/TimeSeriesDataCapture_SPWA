

angular.module('app').service('authenticationService', authenticationService);

authenticationService.$inject = [
    '$log',
    'authenticationNotifyService',
    'configDetails'
];

function authenticationService(
    $log,
    authenticationNotifyService,
    configDetails
) {
    var self = this;

    self.initialize = initialize;

    self.setSession = setSession;

    self.isAuthenticated = isAuthenticated;

    self.login = login;
    self.logout = logout;

    var lock = null;
    var options = {
        autoclose: true,
        auth: {
            responseType: "token id_token",
            redirect: false
        }
    }

    function initialize() {
        if (lock == null) {
            lock = new Auth0Lock(
                configDetails.AUTH0_CLIENTID,
                configDetails.AUTH0_DOMAIN,
                options
            );
        }
    }
    self.initialize();

    function setSession(authResult) {
        $log.log('AUTH RESULT', authResult);
        var expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
        localStorage.setItem('accessToken', authResult.idToken);
        localStorage.setItem('expiresAt', expiresAt)
    }

    function isAuthenticated() {
        var expiresAt = JSON.parse(localStorage.getItem('expiresAt'));
        return new Date().getTime() < expiresAt;
    }

    function login() {
        lock.show();
    }

    function logout() {
        localStorage.setItem('expiresAt', 0);
        localStorage.setItem('accessToken', 'na');
    }

    lock.on('authenticated', function (authResult) {
        lock.getUserInfo(authResult.accessToken, function (error, profile) {
            if (error) {
                $log.error('authentication error');
                return;
            }
            localStorage.setItem('profile', profile.sub);
            self.setSession(authResult);
            authenticationNotifyService.publishAuth0();
        })
    })

}

