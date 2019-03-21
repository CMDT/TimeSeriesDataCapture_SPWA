app.filter('componentIdClassFilter',function(){
    return function(componentId){
       componentId =  componentId.replace(/!/g,'');
       componentId = componentId.replace(/\(/g,'');
       componentId = componentId.replace(/\)/g,''); 
       return '_'+componentId
    }
})