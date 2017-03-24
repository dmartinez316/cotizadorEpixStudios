//var server='http://192.168.1.53/MAKILTECH/backendCotizador/public/index.php/app/';

var server='http://www.epix-studios.com/cotizador/backendCotizador/public/index.php/app/';
angular.module('app.services', [])

.factory('apiCotizador', ['$http', function($http) {
	//var urlBase='http://192.168.1.53/MAKILTECH/backendCotizador/public/index.php/';
	var urlBase='http://www.epix-studios.com/cotizador/backendCotizador/public/index.php/';
    var dataFactory = {};

    dataFactory.eliminarProspecto = function (prospecto_id) {
        return $http.post(urlBase+'app/eliminarProspecto', prospecto_id);
    };    

    dataFactory.guardarNuevaCotizacion = function (cotizacion) {
        return $http.post(urlBase+'app/guardarNuevaCotizacion', cotizacion);
    };

    dataFactory.eliminarCotizacion = function (cotizacion_id) {
        return $http.post(urlBase+'app/eliminarCotizacion', cotizacion_id);
    };
    dataFactory.archivarCotizacion = function (cotizacion_id) {
        return $http.post(urlBase+'app/archivarCotizacion', cotizacion_id);
    };
    dataFactory.getUserData = function () {
        return $http.get(urlBase+'app/userData');
    };
    dataFactory.getAppData = function () {
        return $http.get(urlBase+'app/getAppData');
    };

    dataFactory.signPDFurl = function (cotizacion_id) {
    	return $http.post(urlBase+'signPDFurl',cotizacion_id);
    };

    dataFactory.getCotizacionesArchivadas = function () {
    	return $http.get(urlBase+'app/getCotizacionesArchivadas');
    };

    return dataFactory;
}])



.service('cotizadorModelService',function($q,$localStorage,$http,Upload,$timeout,
	$ionicPopup,$ionicLoading,$state,$ionicHistory,$cordovaFile,$cordovaFileOpener2,apiCotizador){
	//var server='http://localhost:80/backendCotizador/public/index.php/app/';
	//var server='http://www.epix-studios.com/cotizador/backendCotizador/public/index.php/';
	$localStorage=$localStorage.$default({
		appData:{
			"procesosCotizador":[]
		},
		userInfo:{
			"userToken":"",
			"username":"",
			"useremail":""
		}

	});

	var prospectosUsuario;
	var cotizacionesUsuario;
	

	//Variables temporales para ingresar info
	var procesosActivos=null;
	var opcionSeleccionada=null;
	var newProspecto=null;
	var ProspectoCotizacionActivo=null;	
	var backFromCalcular=false;
	var tarifasProc=null;
	//EditarProspecto
	var editarProspecto={
		estadoEditar:false,
		prospectoID:'',
	}

	var procesosCotizacion=[
	{
		id_cotizacion:"",
		id_proceso:"",
		dificultad:"",
		esfuerzo:"",
		costo:"",
		hide:false
	}
	];

	

	return{

		viewPDF:function(cotizacion_id){
			data={'cotizacion_id':cotizacion_id};
			//window.open(response.data);
			apiCotizador.signPDFurl(data)
			.then(function(response){
				console.log(response);
				if(response.data.estado=='200'){
					window.open(response.data.url);
					return{
						estado:response.data.estado
					}
				}else{
					return{
						estado:response.data.estado
					}
				}

			});
		},

		descargarPDF:function(cotizacionPDF){
			cotizacionNueva=angular.copy(cotizacionPDF);
			var prospecto=this.getProspectobyID(cotizacionNueva.opcionesCotizacion.prospectoSeleccionado);
			console.log(prospecto);
			var fecha = (new Date()).toString().split(' ').splice(1,3).join(' ');
			var procesosPDF= {};
			procesosPDF.ul=[];
			for(var i = 0; i<cotizacionNueva.procesosCotizacion.length ; i++){
				if(cotizacionNueva.procesosCotizacion[i].procesos.length>0){
					procesosPDF.ul.push(cotizacionNueva.procesosCotizacion[i].nombre+'-Cantidad('+cotizacionNueva.procesosCotizacion[i].procesos.length+')');
				}
			}
			var requerimientosPDF={};
			requerimientosPDF.ul=[];
			for(var i = 0; i<cotizacionNueva.opcionesCotizacion.requisitos.length ; i++){
				requerimientosPDF.ul.push(cotizacionNueva.opcionesCotizacion.requisitos[i].valor);
			}

			var docDefinition = {
				pageOrientation: 'portrait',
				pageMargins: 90,
				header: function () {
					return {
						margin: [80,50,90,0],
						columns: [
							{
							image: 'data:image/png;base64,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',
							fit: [100, 100],
							},
							{ text: 'PROPUESTA', alignment: 'right',fontSize: 22, bold: true,color:'grey'}
						]
					}
				},

				footer: [
					{
						style:'footer',
						text:'Makila Technologies S.A.S\n NIT. 900506902-6 \n Cll 118 #52b-21,Bogota\n Contacto +57 304 617 4961'
					}	
				],
				content: [
				//SALUDOS
				{	
					margin: [0,72,10,0],
					columns:[{width:100,text:'Señores:', bold: true},{width:'*',text:prospecto.razonSocial,alignment:'left'}]
				},
				{
					margin: [0,0,10,0],
					columns:[{width:100,text:'Fecha:', bold: true},{width:'*',text:fecha+'\n\n',alignment:'left'}]
				},
				{
					margin: [0,0,10,0],
					columns:[
						{width:100,text:'Producto:', bold: true},
						{width:'*',text:cotizacionNueva.opcionesCotizacion.nombre_producto+'\n',alignment:'left'}
					]
				},
				//DESCRIPCION
				{ 
					text: '\nDescripcion\n\n', style: 'subheader' ,margin: [0,0,10,0]
				},
				procesosPDF,
				'\n\n\n',
				//TOTAL
				{
					style: 'total',
					table: {
						widths: ['*', '30%'],
						body: [
							['Valor','COP$ '+cotizacionNueva.costo_total],
						]
					}
				},
				{ text: '\n *Los precios anteriores no incluyen IVA (19%)\n\n'},
				//REQUERIMIENTOS
				{ text: '\n REQUERIMIENTOS\n', style: 'subheader',pageBreak: 'before'},
				{ text: '\nAntes de empezar la producción, el cliente debe entregar lo siguiente\n\n'},
				requerimientosPDF,
				//IMPORTANTE
				{ text: '\n IMPORTANTE\n', style: 'subheader'},
				{
				ul: [
				'Todos los precios mencionados son antes del IVA ',
				'El presente documento tiene una validez de 1 mes'
				]
				},
				//TIEMPO DE ENTREGA
				{
					stack:[
					{ 
						text: '\n\TIEMPO DE ENTREGA:\n\n', style: 'subheader' 
					},
					cotizacionNueva.opcionesCotizacion.tiempo_entrega+' después de recibir el material necesario.\n',
					'Al finalizar cada proceso de la producción se pedirá aprobación para continuar,una vez aprobado, los cambios tendrán costo adicional.\n',
					'Dependiendo de los tiempos de respuesta, puede variar el tiempo de entrega.\n\n\n',
					],
					margin: [0, 20, 0, 0],
					alignment: 'justify'
				},
				//FORMA DE PAGO
				{ 
				text: '\nFORMA DE PAGO:\n\n', style: 'subheader'
				},
				cotizacionNueva.opcionesCotizacion.formaPago,
				{
				ul: [
					'Banco Davivienda \nCuenta Corriente N. 930062131899 \nMakila Technologies SAS\n NIT. 900506902-6'
					]
				}
				],
				styles: {
					header: {
						alignment: 'right',
						margin: [0,0,0,0]		
					},
					subheader: {
						alignment: 'left',
						bold:true
					},
					contentmargin:{
						margin: [10,72,10,0],
					},
					footer:{
						margin: [20, 10, 20, 15],
						fontSize: 10,
						bold:true,
						alignment:'center'
					}
				}
			}

			return $q(function(resolve, reject) {
			          pdfMake.createPdf(docDefinition).getBase64(function(encodedString) {
			            resolve(encodedString);
			          });
			        });
			
		},

		descargarPDFreturn:function(data){
			return this.descargarPDF(data);
		},

		
		orientacionFunction:function(){
			var currentPlatform = ionic.Platform.platform();
			if(currentPlatform=='android' || currentPlatform=='ios'){
				window.addEventListener("orientationchange", function(){
					if(screen.orientation=='portrait'){
						return 'portrait';
					}
					else if(screen.orientation=='landscape'){
						return 'landscape';
					}			   
				});			
			}else{
				 return 'portrait';
			}
		},

		calcularNuevaCotizacion:function(procesos){
			return $http.post(server+'calcularCotizacion',procesos).
			then(function (response) {

				console.log(response);
								
				if(response.data.estado=='200'){
					return{
						estado:response.data.estado,
						msj: response.data.msj					
					}

				}else{
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}
				}
			})
		},

		cambiarVista:function(ruta,disabledBackBool){
			$ionicHistory.nextViewOptions({
				disableBack: disabledBackBool
			});
			$state.go(ruta);
		},

		mensajeBasico:function(encabezado,mensaje,tipoBoton){
			var alertPopup = $ionicPopup.alert
			({
				title: encabezado,
				template: mensaje,
				buttons: [
				{ 
					text: 'Ok',
					type: tipoBoton,
				}
				]
			});
		},
		showLoading : function(mensaje) {
			$ionicLoading.show({
				template: mensaje
			})
		},
		hideLoading : function() {
			$ionicLoading.hide();
		},

		editarProspectoExistente:function(prospecto){
			
			var prospectoEditar=prospecto;
			console.log(prospecto);
			return  $http.post(server+'editarProspecto',prospectoEditar).
			then(function (response) {
				console.log(response);
				if(response.data.estado=='200'){
					console.log('heyo');
					for (var i = 0; i < $localStorage[$localStorage.userInfo.useremail].prospectosUsuario.length ; ++i) {
						if($localStorage[$localStorage.userInfo.useremail].prospectosUsuario[i].id == prospecto.id){
							$localStorage[$localStorage.userInfo.useremail].prospectosUsuario[i].razonSocial=prospecto.razonSocial;
							$localStorage[$localStorage.userInfo.useremail].prospectosUsuario[i].nit=prospecto.nit;
							$localStorage[$localStorage.userInfo.useremail].prospectosUsuario[i].direccion=prospecto.direccion;
							$localStorage[$localStorage.userInfo.useremail].prospectosUsuario[i].email=prospecto.email;
						}
					}
					for (var i = 0; i < $localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos.length ; ++i) {
						if($localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].id_prospecto == prospecto.id){
							$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].razonSocial=prospecto.razonSocial;
						}
					}
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}

				}else{
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}
				}
			})
			
		},

		editarProspecto:function(prospecto_id){
			editarProspecto.estadoEditar=true;
			editarProspecto.prospectoID=prospecto_id;
		},

		initEditarProspecto:function(reset){
			if(reset){
				editarProspecto.estadoEditar=false;			
				editarProspecto.prospectoID='';
			}else{
				return editarProspecto;
			}
			
		},


		getCacheWeight:function(){
			return JSON.stringify($localStorage[$localStorage.userInfo.useremail]).length;
		},

		eraseCache:function(){
			$localStorage.$reset({
				appData:{
					"procesosCotizador":$localStorage.appData.procesosUsuario
				}
			});
			$localStorage[$localStorage.userInfo.useremail]={
				"prospectosUsuario":[],
				"cotizacionesProspectos":[]
			};
			
		},

		initAppData:function(){
			//obtener tarifas del servidor
			var alwaysUpdate=1;
			if(alwaysUpdate||$localStorage.appData.procesosCotizador.length==0){
				 return apiCotizador.getAppData().
					then(function(response){
						//console.log(response);
						if(response.status=="200"){
							$localStorage.appData.procesosCotizador=response.data.procesosCotizador;	
						}else {

						}
				});
			}					
		},

		initUserData:function(){
			var emailString= $localStorage.userInfo.useremail;
			//console.log(emailString);
			 apiCotizador.getUserData().
				then(function(response){
					//console.log(response);
					if(response.data.estado=="200"){
						$localStorage[emailString].prospectosUsuario=response.data.data.prospectosUsuario;
						$localStorage[emailString].cotizacionesProspectos=response.data.data.cotizacionesProspectos;						
						
					}else if(response.data.estado=="500"){
						$localStorage[emailString]={
							"prospectosUsuario":[],
							"cotizacionesProspectos":[]
						};						
					}else if(response.data.estado=="401"){

					}
				});					
		},

		getCotizacionesArchivadas:function(){
			//console.log(emailString);
			 return apiCotizador.getCotizacionesArchivadas().
				then(function(response){
					//console.log(response);
					if(response.data.estado=="200"){						
						return response.data.data.cotizacionesProspectos;
					}else if(response.data.estado=="500"){
						return response.data.data.msj;						
					}else if(response.data.estado=="401"){

					}
				});					
		},

		inicializarTemporales:function(){
			procesosActivos=null;
			opcionSeleccionada=null;
			newProspecto=null;
			ProspectoCotizacionActivo=null;
			backFromCalcular=false;
		},

		setBackFromCalcular:function(){
			backFromCalcular=true;
		},

		getBackFromCalcular:function(){
			return backFromCalcular;
		},

		getProspectos: function(){
			return angular.copy($localStorage[$localStorage.userInfo.useremail].prospectosUsuario);
		},

		getProcesos: function(){
			var procesosUsuario=angular.copy($localStorage.appData.procesosCotizador);
			//console.log(procesosUsuario);
			return procesosUsuario;
		},
		getDetalleTarifas: function(){
			return tarifasProc;
		},

		getTarifasProcesos:function(){

			return  $http.get(server+'getTarifasProcesos').
			then(function (response) {
				//console.log(response);
				if(response.data.estado=='200'){
					return{
						estado:response.data.estado,
						msj: response.data.msj,
						tarifas: response.data.tarifas
					}

				}else{
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}
				}
			})
		},

		getProspectoCotizacionActivo:function(){
			return ProspectoCotizacionActivo;
		},

		getCotizaciones: function(){
			return angular.copy($localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos);
			 
		},

		setString: function(data) {
			newProspecto = data;
		},

		isEmpty: function (value){
			return (value == null || value === "");
		},

		capitalizeFirstLetter:function (string) {
		    return string.charAt(0).toUpperCase() + string.slice(1);
		},

		setProspectoCotizacionActivos:function(data){
			ProspectoCotizacionActivo= data;
		},
		setTarifas:function(data){
			tarifasProc=data;
		},

		addNewProspecto:function(data){
			
			var prospectoNuevo=data;

			return  $http.post(server+'guardarProspecto',prospectoNuevo).
			then(function (response) {
				//console.log(response);
				if(response.data.estado=='200'){
					
					newProspecto={
						id_prospecto:response.data.prospecto_id,
						razonSocial:data.razonSocial,			
						nit:data.nit,
						direccion:data.direccion,
						email:data.email,
						telefono:data.telefono,
						estado:true,
						hide:true

					};
					newCotizacionesUsuario={
						id_prospecto:newProspecto.id_prospecto,
						razonSocial:newProspecto.razonSocial,
						cotizaciones:[],
						hide:true

					};
					$localStorage[$localStorage.userInfo.useremail].prospectosUsuario.push(newProspecto);
					$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos.push(newCotizacionesUsuario);
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}

				}else{
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}
				}
			})
		},

		eliminarProspecto:function(prospecto_id){
			console.log(prospecto_id);
			data={"prospecto_id":prospecto_id};

			return apiCotizador.eliminarProspecto(data).
			then(function (response) {
				console.log(response);
				if(response.data.estado=='200'){
					for (var i = 0; i < $localStorage[$localStorage.userInfo.useremail].prospectosUsuario.length ; ++i) {
						if($localStorage[$localStorage.userInfo.useremail].prospectosUsuario[i].id_prospecto == prospecto_id){
							$localStorage[$localStorage.userInfo.useremail].prospectosUsuario.splice(i,1);
							break;					
						}
					}
					for (var i = 0; i<$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos.length ; i++) {
						if($localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].id_prospecto==prospecto_id){
							$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos.splice(i,1);					
						}
					}
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}

				}else{
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}
				}
			})
		},

		setProcesosActivos: function(data){
			procesosActivos=angular.copy(data);
			//console.log(procesosActivos);
		},

		getProcesosActivos: function(){
			return procesosActivos;
		},
		setOpcionesSeleccionadas:function(data){
			opcionSeleccionada=angular.copy(data);
		},
		getOpcionesSeleccionadas: function(){
			return opcionSeleccionada;
		},

		agregarNuevaCotizacion:function(datos) {

			return this.descargarPDF(datos).then(function(results) {
		    	pdfString = results;
		    	data={
		    		'data': datos,
		    		'pdfBase64String':pdfString
		    	}
		    	//console.log(data);
				return apiCotizador.guardarNuevaCotizacion(data).
				then(function(response){
				//	console.log(response);
					if(response.data.estado=="200"){
						console.log(response);
						datos.id_cotizacion=response.data.cotizacion_id;
						for (var i = 0; i<$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos.length ; i++) {
							if($localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].id_prospecto
								==datos.opcionesCotizacion.prospectoSeleccionado){
								$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].cotizaciones.push(datos);
								break;
							}						
						}
						return{
							estado:response.data.estado,
							msj: response.data.msj
						}
					}else{
						return{
							estado:response.data.estado,
							msj: response.data.msj
						}
					}
				});
		     	
		    });		
			
		},

		eliminarCotizacion:function(id_prospecto,cotizacion_id){
			console.log(cotizacion_id);
			data={"cotizacion_id":cotizacion_id};
			return apiCotizador.eliminarCotizacion(data).
				then(function(response){
				console.log(response);
				if(response.data.estado=="200"){
					for (var i = 0; i<$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos.length ; i++) {
						if($localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].id_prospecto==id_prospecto){
							for (var j = 0; j<$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].cotizaciones.length ; j++) {
								if($localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].cotizaciones[j].id_cotizacion==cotizacion_id){
									$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].cotizaciones.splice(j,1);
									break;
								}									
							}
						}						
					}
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}
				}else if(response.data.estado=="500"){
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}
				}
			});
		},

		archivarCotizacion:function(id_prospecto,cotizacion_id){
			data={"cotizacion_id":cotizacion_id};
			return apiCotizador.archivarCotizacion(data).
				then(function(response){
				console.log(response);
				if(response.data.estado=="200"){
					for (var i = 0; i<$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos.length ; i++) {
						if($localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].id_prospecto==id_prospecto){
							for (var j = 0; j<$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].cotizaciones.length ; j++) {
								if($localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].cotizaciones[j].id_cotizacion==cotizacion_id){
									$localStorage[$localStorage.userInfo.useremail].cotizacionesProspectos[i].cotizaciones.splice(j,1);
									break;
								}									
							}
						}						
					}
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}
				}else if(response.data.estado=="500"){
					return{
						estado:response.data.estado,
						msj: response.data.msj
					}
				}
			});
		},



		getProspectobyID:function(id_prospecto){
			for (var i = 0; i<$localStorage[$localStorage.userInfo.useremail].prospectosUsuario.length ; i++) {
				if($localStorage[$localStorage.userInfo.useremail].prospectosUsuario[i].id_prospecto==id_prospecto){
					return angular.copy($localStorage[$localStorage.userInfo.useremail].prospectosUsuario[i]);
				}
			}
		}
	}

})


.service('AuthService', function($q, $http, USER_ROLES,$localStorage,cotizadorModelService) {
	var LOCAL_TOKEN_KEY = 'userToken';

	var isAuthenticated = false;
	var role = '';
	var authToken;
	  //var server='http://192.168.1.53/MAKILTECH/backendCotizador/public/index.php/app/';
	  //var server='http://localhost:80/backendCotizador/public/index.php/web/';
	  //var server='http://www.epix-studios.com/cotizador/backendCotizador/public/index.php/';


	  var intentarCambioPass=function(data){
	  	return $http.post(server+'cambioPassword',data)
	  }


	  function verificarEmail(email){
	   //console.log(server+'verificarEmail/'+email);
	   return $http.get(server+'verificarEmail/'+email);
	}

	function registrarNuevoUsuario(data){
		return $http.post(server+'registrarse',data);
	}

	function loadUserCredentials() {
		var token = $localStorage.userInfo.userToken;
		if (token) {
			useCredentials(token);
		}else{
			isAuthenticated=false;
		}
	}

	function storeUserCredentials(token,username,email) {
		$localStorage.userInfo.username=username;
		$localStorage.userInfo.userToken=token; 
		$localStorage.userInfo.useremail=email+'_userData';
		var emailString= $localStorage.userInfo.useremail;
		$localStorage[emailString]={
			"prospectosUsuario":[],
			"cotizacionesProspectos":[]
		};	
		useCredentials(token);
		cotizadorModelService.initAppData().then(function(response){
			cotizadorModelService.initUserData();
		})
	}
	

	function useCredentials(token) {
		rol = token.split('.')[0];
		isAuthenticated = true;
		authToken = token.split('.')[1];;

		if (rol == 'admin') {
			role = USER_ROLES.admin
		}
		if (rol == 'premium') {
			role = USER_ROLES.premium
		}
		if (rol == 'free') {
			role = USER_ROLES.free
		}

	    // Set the token as header for your requests!
	    $http.defaults.headers.common['X-Auth-Token'] = token;
	}

	function destroyUserCredentials() {
	  	//$http.delete().then();
	  	$http.delete(server+'borrarToken/'+authToken).then(function (response) {
	  		console.log(response);
	  	});
	  	authToken = undefined;
	  	$localStorage.userInfo.username="";
	  	$localStorage.userInfo.userToken="";
	  	$localStorage.userInfo.useremail="";
	  	isAuthenticated = false;
	  	role='';
	  	$http.defaults.headers.common['X-Auth-Token'] = undefined;
	  }

  	var login = function(data) { 
	  	return  $http.post(server+'login',data).
	  	then(function (response) {
	  		console.log(response);
	  		console.log(response.data.auth);
	  		if(response.data.auth){
	  			storeUserCredentials(response.data.rol + '.'+response.data.token,response.data.username,response.data.email);
	  			
	  			return{
	  				auth:response.data.auth,
	  				msj: response.data.msj
	  			}
	  		}else{
	  			return {
	  				auth:response.data.auth,
	  				msj: response.data.msj,
	  			}

	  		}

	  	});
	  };

	  var logout = function() {
	  	destroyUserCredentials();
	  };

	  var isAuthorized = function(authorizedRoles) {
	  	if (!angular.isArray(authorizedRoles)) {
	  		authorizedRoles = [authorizedRoles];
	  	}
	  	return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
	  };

	  loadUserCredentials();
	  var recuperarContraseña= function(email){
	  	$http.get(server+'recuperarPassword/'+email).then(function(response){
	  		console.log(response);
	  	});
	  }
	  return {
	  	intentarCambioPass:intentarCambioPass,
	  	recuperarContraseña:recuperarContraseña,
	  	login: login,
	  	logout: logout,
	  	isAuthorized: isAuthorized,
	  	verificarEmail:verificarEmail,
	  	registrarNuevoUsuario:registrarNuevoUsuario,
	  	isAuthenticated: function() {return isAuthenticated;},
	  	username: function() {return $localStorage.userInfo.username;},
	  	email: function(){return $localStorage.userInfo.useremail;},
	  	role: function() {return role;}
	  };
})


	.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
		return {
			responseError: function (response) {
				$rootScope.$broadcast({
					401: AUTH_EVENTS.notAuthenticated,
					403: AUTH_EVENTS.notAuthorized
				}[response.status], response);
				return $q.reject(response);
			}
		};
	})

.config(function ($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptor');
});