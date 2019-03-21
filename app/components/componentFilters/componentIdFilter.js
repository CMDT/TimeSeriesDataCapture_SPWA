app.filter('componentIdFilter',function(){
    return function(componentArray){
        var idArray = [];

        for(var i=0,n=componentArray.length;i<n;i++){
           idArray.push(componentArray[i].id);
        }

        return idArray;
    }
})