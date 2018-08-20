app.filter('runFilter',function(){
    return function(componentArray){
        var runArray = [];

        for(var i=0,n=componentArray.length;i<n;i++){
            if(componentArray[i].type == 'run'){
                runArray.push(componentArray[i]);
            }
        }

        return runArray;
    }
})