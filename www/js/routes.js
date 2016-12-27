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

  .state('recuperarPassword', {
    url: '/recuperarPassword',
    templateUrl: 'templates/recuperarPassword.html',
    controller: 'recuperarPasswordCtrl'
  })
  .state('cambiarPassword', {
    url: '/cambiarPassword?tokenpass',
    templateUrl: 'templates/cambiarPassword.html',
    controller: 'cambiarPasswordCtrl'
  })


  .state('app',{
    url:"/app",
    abstract:true,
    cache:false,
    templateUrl:"templates/menu.html",
    controller:'AppCtrl'  
  })  
  
  .state('app.prospectos', {
    url: '/prospectos',
    cache: false,
    views:{
      'menuContent':{
        templateUrl: 'templates/prospectos.html',
        controller: 'prospectosCtrl'
      }
    }
    
  })
  .state('app.agregarProspecto', {
    url: '/agregarProspecto',
    views:{
      'menuContent':{
        templateUrl: 'templates/agregarProspecto.html',
        controller: 'agregarProspectoCtrl'
      }
    }
    
  })

  .state('app.editarProspecto', {
    url: '/editarProspecto',
    views:{
      'menuContent':{
        templateUrl: 'templates/editarProspecto.html',
        controller: 'editarProspectoCtrl'
      }
    }
    
  })

  .state('app.cotizaciones', {
    url: '/cotizar',
    views:{
      'menuContent':{
        templateUrl: 'templates/cotizaciones.html',
        controller: 'cotizacionesCtrl'
      }
    }    
  })
  .state('app.calcular', {
    url: '/calcular',
    cache: false,
    views:{
      'menuContent':{
        templateUrl: 'templates/calcular.html',
        controller: 'calcularCtrl'
      }
    }    
  })
  .state('app.listaDeCotizaciones', {
    url: '/listarcotizaciones',
    views:{
      'menuContent':{
        templateUrl: 'templates/listaDeCotizaciones.html',
        controller: 'listaDeCotizacionesCtrl'
      }
    }    
  })

  .state('app.informacion', {
    url: '/informacion',
    views:{
      'menuContent':{
        templateUrl: 'templates/informacion.html',
        controller: 'informacionCtrl'
      }
    }    
  })  

  .state('app.configuracion', {
    url: '/configuracion',
    views:{
      'menuContent':{
        templateUrl: 'templates/configuracion.html',
        controller: 'configuracionCtrl'
      }
    }    
  }) 

  .state('app.inicio', {
    url: '/inicio',
    views:{
      'menuContent':{
        templateUrl: 'templates/inicio.html',
        controller: 'inicioCtrl'
      }
      
    }    
  }) 


$urlRouterProvider.otherwise('/app/inicio')
  

});