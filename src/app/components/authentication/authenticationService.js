app.service('authenticationService',['$log',function($log){
    var lock = null;

    var options = {
        autoclose: true,
        auth:  {
            responseType: "token id_token",
            redirect: false
        }
    }

    this.initialize = function(){

        if(lock == null){

        lock = new Auth0Lock(
            '0XLhzBnfbBmbmKU6OnEan4CU5lLWkD81',
            'timeseriestest.eu.auth0.com',
            options
          );
        }
        
    }

    this.initialize();



    this.login = function(){
        lock.show();
    }

    lock.on('authenticated',function(authResult){
        lock.getUserInfo(authResult.accessToken, function(error, profile){
            if(error){
                $log.error('authentication error');
                return;
            }

        
            localStorage.setItem('accessToken',authResult.idToken);
            console.log(authResult.idToken);


            
        })
    })
}])

