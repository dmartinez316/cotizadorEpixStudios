angular.module('app.directives', [])


.filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
}])

.filter('meses', ['$filter', function ($filter) {
	  return function (input) {
	  	if(input==0){
	  		return '-';
	  	}else{
	  		var output;
		  	value=input/30;
		  	meses=Math.floor(value);
		  	dias=value - Math.floor(value);
		  	dias=dias.toFixed(1)*30;
		    return meses+' meses y '+dias+' dias';
	  	}
	  	
	  };
	}]);


