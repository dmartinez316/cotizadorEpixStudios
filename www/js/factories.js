angular.module('app.factories', [])

.factory('apiCotizador', ['$http', function($http) {
  var urlBase='http://192.168.1.52/MAKILTECH/backendCotizador/public/index.php/app/';
//var urlBase='http://www.epix-studios.com/cotizador/backendCotizador/public/index.php/app/';
    var dataFactory = {};

    dataFactory.guardarNuevaCotizacion = function (cotizacion) {
        return $http.post(urlBase+'guardarNuevaCotizacion', cotizacion);
    };

    dataFactory.eliminarCotizacion = function (cotizacion_id) {
        return $http.delete(urlBase+'eliminarCotizacion', cotizacion_id);
    };

    return dataFactory;
}]);