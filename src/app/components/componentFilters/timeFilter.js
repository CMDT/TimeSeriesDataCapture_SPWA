app.filter('timeFilter',function(){
    return function(time){
        var decodeTime = ''
        for(var i=0;i<2;i++){
            decodeTime += time.slice(i*2,(i+1)*2) + ':';
        }
        decodeTime += time.slice(4,6);
        return decodeTime;
    }
})