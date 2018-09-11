app.service('authenticationNotifyService',['$log',function($log){
    

    var self = this;
    var controllers = new Map();

    function Wrapper(id = uniqueId(),callback) {
        this.id = id;
        var value;
        this.set = function(v) {
            value = v;
            callback(this);
        }
        this.get = function() {
            return value;
        }  
    }

    

    this.subscribe = function(id,callback){
        var wrapper = new Wrapper(id,callback);
        controllers.set(wrapper.id,wrapper);
        return id;
    }

    this.publish = function(id){
        

        var wrapper = controllers.get(id);
        wrapper.set('auth');
    }

    function uniqueId() {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    };

}])

