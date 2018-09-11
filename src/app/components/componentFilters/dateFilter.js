app.filter('dateFilter',function(){
    return function(date){
        var year = date.slice(0,4);
        var month = date.slice(4,6);
        var day = date.slice(6);
        
        var decodeDate = day +'/' + month + '/' + year;
        return decodeDate
    }
})