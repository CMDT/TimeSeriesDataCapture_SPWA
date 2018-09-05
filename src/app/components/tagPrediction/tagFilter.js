app.filter('tagFilter',function(){
    return function(tagObjectArray){
        var tagArray = [];

        for(var i=0,n=tagObjectArray.length;i<n;i++){
            tagArray.push(tagObjectArray[i].tag);
        }

        return tagArray;
    }
})