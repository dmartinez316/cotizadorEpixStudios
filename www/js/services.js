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
	var controllerFlag=false;
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

		setBackFromController:function(controlador){
			controllerFlag=controlador;
		},

		getBackFromAnotherController:function(){
			return controllerFlag;
		},

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
			
			var imagenMuestra = "data:image/jpeg;base64,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";

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
				'\n\n',
				// {
				// 	style: 'tableExample',
				// 	table: {
				// 		headerRows: 1,
				// 		widths: ['50%', '50%'],
				// 		// dontBreakRows: true,
				// 		// keepWithHeaderRows: 1,
				// 		body: [
				// 			[{text: 'Muestra 1', style: 'tableHeader'}, 
				// 			{text: 'Muestra 2', style: 'tableHeader'}],
				// 			[
				// 				{
				// 					image:imagenMuestra,
				// 					width: 200
				// 				},
				// 				{
				// 					image:imagenMuestra,
				// 					width: 200
				// 				}
				// 			]
				// 		]
				// 	}
				// },

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

			//pdfMake.createPdf(docDefinition).download('optionalName.pdf');
			
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
					console.log(response);
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
			controllerFlag=false;
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