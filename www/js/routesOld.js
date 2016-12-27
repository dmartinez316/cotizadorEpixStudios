angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider,USER_ROLES) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider   
  
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('prospectos', {
    cache: false,
    url: '/prospectos',
    templateUrl: 'templates/prospectos.html',
    controller: 'prospectosCtrl'
  })

  .state('agregarProspecto', {
    url: '/agregarProspecto',
    templateUrl: 'templates/agregarProspecto.html',
    controller: 'agregarProspectoCtrl'
  })

  .state('cotizaciones', {
    url: '/cotizar',
    templateUrl: 'templates/cotizaciones.html',
    controller: 'cotizacionesCtrl'
  })

  .state('calcular', {
    url: '/calcular',
    templateUrl: 'templates/calcular.html',
    controller: 'calcularCtrl'
  })

  .state('listaDeCotizaciones', {
    url: '/listarcotizaciones',
    templateUrl: 'templates/listaDeCotizaciones.html',
    controller: 'listaDeCotizacionesCtrl'
  })
  

  .state('exportar', {
    url: '/exportar',
    templateUrl: 'templates/exportar.html',
    controller: 'exportarCtrl'
  })

  

  .state('informacion', {
    url: '/informacion',
    templateUrl: 'templates/informacion.html',
    controller: 'informacionCtrl'
  })

  .state('configuracion', {
    url: '/configuracion',
    templateUrl: 'templates/configuracion.html',
    controller: 'configuracionCtrl'
  }) 

  .state('home', {
    url: '/landing',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })

$urlRouterProvider.otherwise('/landing')

  

});