app.service('authenticationNotifyService',['$log',function($log){
    

    var self = this;
    var wrapper;

    function Wrapper(callback) {
        var value;
        this.set = function(v) {
            value = v;
            callback(this);
        }
        this.get = function() {
            return value;
        }  
    }


    this.subscribe = function(callback){
        wrapper = new Wrapper(callback);
    }

    this.publish = function(){
        if(wrapper != undefined){
            wrapper.set('auth');
        }
    }

}])

