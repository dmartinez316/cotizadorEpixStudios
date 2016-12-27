angular.module('app.controllers', [])

.controller('AppCtrl',function($rootScope,$scope,AuthService,$ionicHistory,$ionicPopup,$http,$state,cotizadorModelService){
	$rootScope.username=AuthService.username();

	if(!AuthService.isAuthenticated()){
		AuthService.logout();
		var errorEmptyAlert=$ionicPopup.alert({
			title: 'Ingresa',
			template: 'Ingresa con tu usuario o crea uno nuevo!',
			buttons: [
			{ 
				text: 'Ok',
				type: 'button-dark',
			}
			]
		});
		cotizadorModelService.cambiarVista('login',true);
	}else{
		cotizadorModelService.initUserData();  

		var currentPlatform = ionic.Platform.platform();
		console.log(currentPlatform); 
	}

	$scope.logout = function() {
		AuthService.logout();
		cotizadorModelService.cambiarVista('login',true);
	};
})

.controller('prospectosCtrl', function($scope,cotizadorModelService,$ionicPopup,$q,$state) {
	//inicialziar al abrir la pestaña de prospectos. Cargar prospectos 
	$scope.prospectosUsuario=cotizadorModelService.getProspectos();
	//Cargar prospectos de usuario de la bd

	$scope.removeProspect=function(prospecto_id,prospectoBD_id){
		var confirmPopup = $ionicPopup.confirm({
			title: 'Eliminar Prospecto',
			template: '¿Está seguro que quiere eliminar este prospecto? Tambien eliminaran todas las cotizaciones relacionadas con el',
			buttons: [
			{ 
				text: 'Cancelar',
				type: 'button-balanced'
			},
			{
				text: '<b>Ok</b>',				
				onTap: function(e) {

					cotizadorModelService.showLoading('Cargando...');
					cotizadorModelService.removeProspect(prospecto_id,prospectoBD_id).
					then(function(data) {
						console.log(data);
						cotizadorModelService.hideLoading();
						if(data.estado=='200'){
							cotizadorModelService.mensajeBasico('Exito',data.msj,'button-balanced');

							for (var i = 0; i < $scope.prospectosUsuario.length ; ++i) {
								if($scope.prospectosUsuario[i].id == prospecto_id){
									$scope.prospectosUsuario[i].estado=false;
									break;						
								}
							}			
						}else if(data.estado=='500'){
							cotizadorModelService.mensajeBasico('Error',data.msj+',intenta de nuevo.','button-balanced');
						}else if(data.estado=='200'){
							cotizadorModelService.mensajeBasico('Error','No se encontro sesion activa, ingresa de nuevo','button-balanced');
							
							AuthService.logout();							
							cotizadorModelService.cambiarVista('login',true);

						}

					}, function(err) {
						console.log(err);
						cotizadorModelService.hideLoading();
						cotizadorModelService.mensajeBasico('Error',err.msj,'button-balanced');
						
					});	
				}
			}]
		});
	}

	$scope.editarProspecto=function(prospecto_id,prospectoBD_id){
		cotizadorModelService.editarProspecto(prospecto_id,prospectoBD_id);
		cotizadorModelService.cambiarVista('app.editarProspecto',false);
	}
})

.controller('editarProspectoCtrl', function($scope,$ionicPopup,cotizadorModelService,$state,$ionicHistory) {
	var data=cotizadorModelService.initEditarProspecto(false);
	if(data.estadoEditar){
		$scope.infoProspecto=cotizadorModelService.getProspectobyID(data.prospectoID);
		console.log($scope.infoProspecto);
	}else{
		cotizadorModelService.initEditarProspecto(true);		
		cotizadorModelService.mensajeBasico('Error','No se selecciono ningun prospecto para editar','button-balanced');
		cotizadorModelService.cambiarVista('app.prospectos',false);
	}

	$scope.editarProspecto=function(){
		//console.log("hola");
		if( cotizadorModelService.isEmpty($scope.infoProspecto.razonSocial)||
			cotizadorModelService.isEmpty($scope.infoProspecto.nit)||
			cotizadorModelService.isEmpty($scope.infoProspecto.direccion)||
			cotizadorModelService.isEmpty($scope.infoProspecto.email)||			
			cotizadorModelService.isEmpty($scope.infoProspecto.telefono)
			){
			cotizadorModelService.mensajeBasico('Error','Existen campos vacios en el formulario, adicionalmente el email debe tener arroba','button-balanced');
			
		}else{
			cotizadorModelService.editarProspectoExistente($scope.infoProspecto).
			then(function(data) {
				console.log(data);
				cotizadorModelService.hideLoading();
				if(data.estado=='200'){
					cotizadorModelService.mensajeBasico('Exito',data.msj,'button-balanced');		
					cotizadorModelService.initEditarProspecto(true);
					cotizadorModelService.cambiarVista('app.prospectos',true);		
				}else if(data.estado=='500'){
					cotizadorModelService.mensajeBasico('Error',data.msj+',intenta de nuevo.','button-balanced');
				}else if(data.estado=='200'){
					cotizadorModelService.mensajeBasico('Error','No se encontro sesion activa, ingresa de nuevo','button-balanced');
					AuthService.logout();							
					cotizadorModelService.cambiarVista('app.prospectos',true);

				}

			}, function(err) {
				console.log(err);
				cotizadorModelService.hideLoading();
				cotizadorModelService.mensajeBasico('Error',err.msj,'button-balanced');
				
			});	

		}
	}

	$scope.cancelarEdicion=function(){
		cotizadorModelService.initEditarProspecto(true);
		cotizadorModelService.cambiarVista('app.prospectos',true);
	}
})

.controller('agregarProspectoCtrl', function($scope,$ionicPopup,cotizadorModelService,$state,$q,$ionicHistory) {
	console.log("hola");	
	$scope.required = true;
	$scope.nuevoProspecto={
		razonSocial:"",
		nit:"",
		direccion:"",
		email:"",
		telefono:""
	};

	$scope.agregarNuevoProspecto=function(){
		if( cotizadorModelService.isEmpty($scope.nuevoProspecto.razonSocial)||			
			cotizadorModelService.isEmpty($scope.nuevoProspecto.direccion)||
			cotizadorModelService.isEmpty($scope.nuevoProspecto.email)||			
			cotizadorModelService.isEmpty($scope.nuevoProspecto.telefono)
			){

			var errorEmptyAlert=$ionicPopup.alert({
				title: 'Campos Vacios',
				template: 'Existen campos vacios en el formulario, el email debe tener arroba',
				buttons: [
				{ 
					text: 'Ok',
					type: 'button-dark',

				}
				]
			});



	}else{
		var confirmPopup = $ionicPopup.confirm({
			title: 'Agregar Prospecto',
			template: '¿Quiere agregar el prospecto '+$scope.nuevoProspecto.razonSocial+'?',
			buttons: [
			{ 
				text: 'Cancelar' 
			},
			{
				text: '<b>Ok</b>',
				type: 'button-dark',
				onTap: function(e) {
					cotizadorModelService.showLoading('Cargando...');
					promiseProcesoLogin=cotizadorModelService.addNewProspecto($scope.nuevoProspecto).
					then(function(data) {
						console.log(data);
						cotizadorModelService.hideLoading();
						if(data.estado=='200'){
							cotizadorModelService.mensajeBasico('Exito',data.msj,'button-balanced');
							cotizadorModelService.cambiarVista('app.prospectos',true);				
						}else if(data.estado=='500'){
							cotizadorModelService.mensajeBasico('Error',data.msj+',intenta de nuevo.','button-balanced');
						}else if(data.estado=='200'){
							cotizadorModelService.mensajeBasico('Error','No se encontro sesion activa, ingresa de nuevo','button-balanced');
							
							AuthService.logout();							
							cotizadorModelService.cambiarVista('login',true);

						}

					}, function(err) {
						console.log(err);
						cotizadorModelService.hideLoading();
						cotizadorModelService.mensajeBasico('Error',err.msj,'button-balanced');
						
					});	
				}
			}
			]
		});
	}
}

})

.controller('cotizacionesCtrl', function($scope,$ionicPopup,cotizadorModelService,$state,$ionicHistory) {
	//inicialziar al abrir la pestaña de cotizaciones. Cargar prospectos y crear un procesosUsuariolimpio
	//$scope.prospectosUsuario=["Comred","ToroLove"];
	$scope.onHold=function(){
		console.log("holded");
	}
	$scope.orientacion='portrait';
	var currentPlatform = ionic.Platform.platform();
	if(currentPlatform=='android' || currentPlatform=='ios'){
			window.addEventListener("orientationchange", function(){
				if(screen.orientation=='portrait'){
					$scope.orientacion='portrait';
				}
				else if(screen.orientation=='landscape'){
					$scope.orientacion='landscape';
				}
			   
			});
			
		}else{
			$scope.orientacion='portrait';
		}
	

	$scope.prospectosUsuario= cotizadorModelService.getProspectos();
	console.log($scope.prospectosUsuario.length);
	if($scope.prospectosUsuario.length==0){
		var emptyActivosAlert=$ionicPopup.alert({
			title: 'No existen prospectos agregados',
			template: 'Agrega uno o mas prospectos para poder cotizar ',
			buttons: [
			{ 
				text: 'Ok',
				type: 'button-balanced',

			}
			]
		});
		cotizadorModelService.inicializarTemporales();
		cotizadorModelService.cambiarVista('app.prospectos',true);

	}

	$scope.decrecerValor=function(proceso,tipo){
		if(tipo==0){// proceso.dias
			if( parseInt(proceso.dias)>1){
				proceso.dias= parseInt(proceso.dias)-1;
			}
		}else if(tipo==1){ //proceso.dificultad
			if( parseInt(proceso.dificultad)>1 ){
				proceso.dificultad=parseInt(proceso.dificultad)-1;				
			}
		}
	}

	$scope.aumentarValor=function(proceso,tipo){
		if(tipo==0){// proceso.dias
			if( parseInt(proceso.dias)<100){
				proceso.dias= parseInt(proceso.dias)+1;
			}
			
		}else if(tipo==1){ //proceso.dificultad
			if( parseInt(proceso.dificultad)<3){
				proceso.dificultad=parseInt(proceso.dificultad)+1;
			}
		}
	}
	//Cargar prospectos de usuario de la bd	
	
	/*if(cotizadorModelService.getBackFromCalcular()){
		$scope.prospectosUsuario= cotizadorModelService.getProcesosActivos();
	}else{
		
	}*/
	$scope.procesosUsuario= cotizadorModelService.getProcesos();
	$scope.tarifaDetalle= cotizadorModelService.getDetalleTarifas();
	//console.log($scope.procesosUsuario);
	//console.log($scope.tarifaDetalle);
	for(var i=0; i<$scope.procesosUsuario.length;++i){
		var count=0;
		for (var j=0; j<$scope.tarifaDetalle.length;++j) {
		 	if($scope.procesosUsuario[i].id_proceso==$scope.tarifaDetalle[j].id_proceso){
		 		count++;
		 	}
		}
		$scope.procesosUsuario[i].rango_dificultad=count;
	}
	
	//convertir a json el campo de opciones en los procesos
	if(typeof($scope.procesosUsuario[0].opciones)=='string'){		
		for(var i=0; i<$scope.procesosUsuario.length;++i){
			$scope.procesosUsuario[i].opciones=JSON.parse($scope.procesosUsuario[i].opciones);
		}
	}
	$scope.cambiarRangoDias=function(id_proc,dificultad){
		for (var i = 0; i < $scope.procesosUsuario.length ; ++i) {
			if($scope.procesosUsuario[i].id_proceso == id_proc){
				for(var j=0; j<$scope.tarifaDetalle.length;++j){
					if($scope.tarifaDetalle[j].dificultad==dificultad &&
						$scope.tarifaDetalle[j].id_proceso==id_proc){

						$scope.procesosUsuario[i].dias_min=Math.ceil($scope.tarifaDetalle[j].dias_minimos*24);
						$scope.procesosUsuario[i].dias_max=$scope.procesosUsuario[i].dias_min+50;
						$scope.procesosUsuario[i].dias=$scope.procesosUsuario[i].dias_min;
						$scope.procesosUsuario[i].tipo_artista=
						cotizadorModelService.capitalizeFirstLetter($scope.tarifaDetalle[j].tipo_artista);
					}
				}
			}
		}
	}
	//console.log($scope.procesosUsuario);
	$scope.forma_Pago=["Anticipo 25%, 25% Primera entrega 50% al final","Anticipo 50% y  50% al final","Anticipo 75% y  25% al final"];
	$scope.tipo_artista=["Junior","Profesional","Senior","Maquina buena","Maquina excelente"];
	$scope.opcionesSeleccionadas={prospectoSeleccionado: null,formaPago:null,nombre_producto:null,tiempo_entrega:null,requisitos:null};
	cotizadorModelService.inicializarTemporales();
	$scope.addProcess=function(id){
		//alert(id);
	//console.log(angular.toJson($scope.procesosUsuario));
		//cambair estado a true
		//cambiar color de fondo del boton
		for (var i = 0; i < $scope.procesosUsuario.length ; ++i) {
			if($scope.procesosUsuario[i].id_proceso == id){

				if($scope.procesosUsuario[i].estado==false){
					$scope.procesosUsuario[i].estado=true;			
					$scope.procesosUsuario[i].classType="button button-balanced";
					break;
					//alert("cambie algo papu");
				}else if($scope.procesosUsuario[i].estado==true){
					$scope.procesosUsuario[i].estado=false;
					$scope.procesosUsuario[i].classType="button button-stable";
					break;

				}else{

				}				
			}
		}
	}

	$scope.calcularItems=function(){
		$scope.procesosActivos=[];
		for (var i = 0; i < $scope.procesosUsuario.length ; ++i) {	

			if($scope.procesosUsuario[i].estado==true){
				$scope.procesosActivos.push($scope.procesosUsuario[i]);
			}

		}
		//console.log($scope.procesosActivos);

		//console.log($scope.prospectoCotizacion);

		//console.log($scope.opcionesSeleccionadas.prospectoSeleccionado);

		//console.log($scope.opcionesSeleccionadas.formaPago);

		if($scope.procesosActivos.length!=0 && $scope.opcionesSeleccionadas.prospectoSeleccionado != null && $scope.opcionesSeleccionadas.formaPago != null
			&& $scope.opcionesSeleccionadas.nombre_producto != null&& $scope.opcionesSeleccionadas.tiempo_entrega != null&& $scope.opcionesSeleccionadas.requerimientos != null){

			cotizadorModelService.setProcesosActivos($scope.procesosActivos);
			cotizadorModelService.setOpcionesSeleccionadas($scope.opcionesSeleccionadas);
			cotizadorModelService.setBackFromCalcular();

			//cotizadorModelService.setProspectoCotizacionActivos($scope.prospectoCotizacion);

			cotizadorModelService.cambiarVista('app.calcular',false);

		}else{
			cotizadorModelService.mensajeBasico('No hay procesos','Agrega uno o mas procesos y llena la informacion adicional','button-balanced');
			
		}			
	}
})

.controller('listaDeCotizacionesCtrl', function($scope,cotizadorModelService,$ionicPopup) {
	$scope.cotizacionesProspectos=cotizadorModelService.getCotizaciones();

	//console.log($scope.cotizacionesProspectos);

	$scope.removeCotizacion=function(parentIndex,id){
		//console.log(id);
		var confirmPopup = $ionicPopup.confirm({
			title: 'Eliminar Cotizacion',
			template: '¿Está seguro que quiere eliminar esta cotizacion?',
			buttons: [
			{ 
				text: 'Cancelar',
				type: 'button-balanced',
			},
			{
				text: '<b>Ok</b>',			
				onTap: function(e) {
					for(var k= 0; k<$scope.cotizacionesProspectos[parentIndex].cotizaciones.length; k++ ){
						if($scope.cotizacionesProspectos[parentIndex].cotizaciones[k].id_cotizacion == id){
							$scope.cotizacionesProspectos[parentIndex].cotizaciones[k].estado=false;
							console.log($scope.cotizacionesProspectos);
								//cotizadorModelService.removeProspecto(id);
								//$scope.prospectosUsuario=cotizadorModelService.getProspectos();
								break;						
							}
						}	
					}
				}
				]
			});
	}

	$scope.descargarpdf=function(procesos,prospecto_id,cotizacionNueva){
		console.log(procesos);
		console.log(prospecto_id);
		console.log(cotizacionNueva);
		cotizadorModelService.descargarPDF(procesos,prospecto_id,cotizacionNueva);

	};		
})  


.controller('calcularCtrl', function($scope,$ionicLoading,$q,$ionicPopup,cotizadorModelService,$state,$ionicHistory,$timeout) {
	$scope.procesosCotizacion=[];

	cotizadorModelService.showLoading('Cargando...');
	$scope.totalCotizacion=0;

	//TRAER PROCESOS ACTIVOS DESDE COTIZACIONES
	//TRAER OPCIONES DESDE COTIZACIONES
	$scope.procesosActivos=cotizadorModelService.getProcesosActivos();
	$scope.opcionesSeleccionadas=cotizadorModelService.getOpcionesSeleccionadas();

	//$scope.prospectoCotizacion=cotizadorModelService.getProspectoCotizacionActivo();
	var procesosCotizacionServidor=[];

	$scope.id_cotizacion=cotizadorModelService.getCotizacionID();

	//VER SI ESTA VACIO PROCESOS ACTIVOS Y OPCIONES SELECCIONADAS
	if(!cotizadorModelService.isEmpty($scope.procesosActivos) || 
		!cotizadorModelService.isEmpty($scope.opcionesSeleccionadas)){
		//COPIAR A UNA VARIABLE TEMPORAL PARA ENVIAR AL SERVIDOR LOS PROCESOS
		for(var i=0; i<$scope.procesosActivos.length; ++i){

			var temp1={
				id_proceso:$scope.procesosActivos[i].id_proceso,
				nombre:$scope.procesosActivos[i].nombre,
				dificultad:$scope.procesosActivos[i].dificultad,
				esfuerzo:$scope.procesosActivos[i].dias,
			}
			//console.log(temp);
			procesosCotizacionServidor.push(temp1);
		}
		//ENVIAR PROCESOS Y RECIBIR COSTO
		cotizadorModelService.calcularNuevaCotizacion(procesosCotizacionServidor).
		then(function(datos) {
			console.log(datos);
			if(datos.estado=='200'){
				var procesosCosto=JSON.parse(datos.msj);
				console.log(procesosCosto);
				for(var i=0; i<$scope.procesosActivos.length; ++i){
					for(var j=0; j<procesosCosto.costosProcesos.length;++j){
						if(procesosCosto.costosProcesos[j].id_proceso==$scope.procesosActivos[i].id_proceso){
							var temp={
								id_proceso:$scope.procesosActivos[i].id_proceso,
								nombre:$scope.procesosActivos[i].nombre,
								dificultad:$scope.procesosActivos[i].dificultad,
								esfuerzo:$scope.procesosActivos[i].dias,
								tipo_artista:$scope.procesosActivos[i].tipo_artista,
								costo:procesosCosto.costosProcesos[j].costo_proceso,
								opciones:$scope.procesosActivos[i].opciones
							}
						}
							
					}

					$scope.procesosCotizacion.push(temp);			
				}

			cotizadorModelService.hideLoading();
			for (var i = $scope.procesosCotizacion.length - 1; i >= 0; i--) {
				console.log($scope.procesosCotizacion[i].costo);
				$scope.totalCotizacion+=parseFloat($scope.procesosCotizacion[i].costo);
			}
			$scope.totalCotizacion= Math.round($scope.totalCotizacion* 100) / 100;
			console.log($scope.procesosCotizacion);

			var cotizacionNueva={
				"id_cotizacion":$scope.id_cotizacion,
				"forma_pago":$scope.opcionesSeleccionadas.formaPago,
				"nombre_producto":$scope.opcionesSeleccionadas.nombre_producto,
				"tiempo_entrega":$scope.opcionesSeleccionadas.tiempo_entrega,
				"requerimientos":$scope.opcionesSeleccionadas.requerimientos,
				"costo_total":$scope.totalCotizacion,
				"procesosCotizacion":$scope.procesosCotizacion,
				"estado":true,
				"hide":false
			};

			//console.log($scope.procesosCotizacion);
			$scope.guardarCotizacion= function(){
				//console.log($scope.opcionesSeleccionadas.prospectoSeleccionado.id);
				cotizadorModelService.agregarNuevaCotizacion($scope.opcionesSeleccionadas.prospectoSeleccionado.id,cotizacionNueva);
				cotizadorModelService.cambiarVista('app.listaDeCotizaciones',true);

			}
			$scope.exportarCotizacion= function(){
				//Enviar parametros para generar pdf
				cotizadorModelService.descargarPDF($scope.procesosCotizacion,$scope.opcionesSeleccionadas.prospectoSeleccionado.id,cotizacionNueva);

			}

		}else{
			cotizadorModelService.hideLoading();
			cotizadorModelService.mensajeBasico('Error','Ocurrio un error, intentalo mas tarde','button-balanced');
			cotizadorModelService.cambiarVista('app.cotizaciones',true);
		}

		});
		

	}else{
		//console.log("falso");
		cotizadorModelService.hideLoading();
		cotizadorModelService.mensajeBasico('Error','No hay procesos activos para calcular o no se han definido opciones','button-balanced');
		cotizadorModelService.cambiarVista('app.cotizaciones',true);
	}

})



.controller('loginCtrl', function($scope,$ionicHistory,$state,$q,$location,$http,AuthService,$ionicPopup,$ionicLoading,AuthService) {
	
	console.log(ionic.Platform.platform());
	$scope.title="Login";
	$scope.error=false;
	$scope.mensajeBasico=function(encabezado,mensaje,tipoBoton){
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
	};
	$scope.show = function() {
		$ionicLoading.show({
			template: 'Cargando...'
		})
	};
	$scope.hide = function() {
		$ionicLoading.hide();
	};

	$scope.credenciales = {email:"",password:""};

	$scope.login = function(data) {
		//cordovaNetwork.isOnline() ||//
		if(!navigator.onLine){
			$scope.mensajeBasico('Error','No existe conexion a internet en el momento','button-balanced');
		}else{
			if($scope.credenciales.email==""||$scope.credenciales.password==""){
				$scope.mensajeBasico('Error','Existen campos vacios','button-balanced');
			}else{ 
				$scope.show();
				console.log($scope.credenciales);
				promiseProcesoLogin=AuthService.login($scope.credenciales).
				then(function(data) {
					$scope.hide();
					if(data.auth){
						$ionicHistory.nextViewOptions({
							disableBack: true
						});
						$state.go('app.inicio');
					}else{
						$scope.mensajeBasico('Error',data.msj,'button-balanced');
						$scope.credenciales.password="";
					}
					
				}, function(err) {
					console.log(err);
					$scope.hide();
					$scope.mensajeBasico('Error',err.msj,'button-balanced');
					$scope.credenciales.password="";
				});
			}
		}

	};	
})

.controller('signupCtrl', function($scope,AuthService,$ionicPopup,$q,$state,$ionicHistory,$ionicLoading) {
	$scope.mensajeBasico=function(encabezado,mensaje,tipoBoton){
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
	};


	$scope.show = function() {
		$ionicLoading.show({
			template: 'Cargando...'
		})
	};
	$scope.hide = function() {
		$ionicLoading.hide();
	};

	$scope.newUser={names:"",email:"",password:"",repassword:""};	
	$scope.title="Registro";
	$scope.attemptRegistration=function(){

		//alert($scope.newUser.user);
		//cordovaNetwork.isOnline() ||//
		if(!navigator.onLine){
			
			//verificar conexion a internet
			$scope.mensajeBasico('Error','No existe conexion a internet en el momento','button-balanced');
		}else{
			
			//chequear por campos vacios
			if($scope.newUser.names != "" && 
				$scope.newUser.email != "" &&
				$scope.newUser.password != "" )
			{
			//	console.log($scope.newUser);
			if($scope.newUser.password == $scope.newUser.repassword)
			{	
				//PROMESA DEL EEMAIL
				promiseVerificarEmail=AuthService.verificarEmail($scope.newUser.email);
				promiseVerificarEmail.then(
					function(result) {
						result.data = result.data.replace(/(\r\n|\n|\r)/gm,"");
						console.log(result);
						if(result.data=="No existe correo igual"){
							$scope.show();
							//PROMESA DE CONFIRMACION DE REGISTRO
							var estadoRegistro=AuthService.registrarNuevoUsuario($scope.newUser);
							estadoRegistro.then(
								function(result) {
									result.data = result.data.replace(/(\r\n|\n|\r)/gm,"");
									console.log(result);
									if(result.data=="Registro existoso"){
										console.log(result.data);
										$scope.hide();
										$scope.mensajeBasico('Exito','El registro se realizo exitosamente, ingresa con tu correo','button-balanced');
										$ionicHistory.nextViewOptions({
											disableBack: true
										});
										cotizadorModelService.cambiarVista('login',true);
									}else if(result.data=="Error"){
										console.log(result);
										console.log(result.data);
										$scope.hide();
										$scope.mensajeBasico('Error','Ocurrio un error inesperado, intentalo de nuevo','button-balanced');
									}
								},
								function(err) {console.log('hola');
								return err;
							});
						}else if(result.data=="Existe un correo igual"){console.log('hola');
						$scope.mensajeBasico('Error','Ya existe un usuario registrado con este correo electronico','button-balanced');
					}
				}, function(err) {console.log('hola');
				return err;
			}
			);
			}else{
				$scope.mensajeBasico('Error','No coinciden los campos que se ingresaron en la contraseña','button-balanced');
			}
		}else{
			$scope.mensajeBasico('Error','Existen campos vacios en el formulario','button-balanced');
		}				
	}
}	
})

.controller('inicioCtrl', function($scope,$rootScope, $state,$ionicHistory, $ionicPopup, AuthService, AUTH_EVENTS,cotizadorModelService) {
	cotizadorModelService.initAppData();
	

	$scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
		var alertPopup = $ionicPopup.alert({
			title: 'Unauthorized!',
			template: 'You are not allowed to access this resource.'
		});
	});

	$scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
		AuthService.logout();
		cotizadorModelService.cambiarVista('login',true);
		var alertPopup = $ionicPopup.alert({
			title: 'Session Lost!',
			template: 'Sorry, You have to login again.'
		});
	});

	$scope.setCurrentUsername = function(name) {
		$scope.username = name;
	};
	$scope.logout = function() {
		AuthService.logout();
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		cotizadorModelService.cambiarVista('login',true);
	};

})

.controller('configuracionCtrl', function($scope,cotizadorModelService,$state,$ionicHistory,$ionicPopup,AuthService) {
	$scope.Cache= cotizadorModelService.getCacheWeight()/1000;
	$scope.deleteCache= function(){


		var confirmPopup = $ionicPopup.confirm({
			title: 'Borrar cache',
			template: '¿Está seguro que quiere borrar su información almacenada?',
			buttons: [
			{ 
				text: 'Cancelar',
				type: 'button-dark'
			},
			{
				text: '<b>Ok</b>',				
				onTap: function(e) {
					cotizadorModelService.cambiarVista('app.inicio',true);
				}
			}
			]
		});		
	}

	$scope.logout = function() {
		AuthService.logout();
		cotizadorModelService.cambiarVista('login',true);
	};
})

.controller('recuperarPasswordCtrl', function($scope,AuthService,$ionicPopup,$q,$state,$ionicHistory,$ionicLoading) {
	$scope.recuperarPass={ email:''};
	$scope.show = function() {
		$ionicLoading.show({
			template: 'Cargando...'
		})
	};
	$scope.hide = function() {
		$ionicLoading.hide();
	};

	$scope.mensajeBasico=function(encabezado,mensaje,tipoBoton){
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
	};
	$scope.intentarRecuperarPass=function(){
		
		if($scope.recuperarPass.email==''){
			$scope.mensajeBasico('Error','Porfavor ingresa un email para continuar','button-balanced');
		}else{
			promiseVerificarEmail=AuthService.verificarEmail($scope.recuperarPass.email);
			promiseVerificarEmail
			.then(
				function(result) {
					result.data = result.data.replace(/(\r\n|\n|\r)/gm,"");
					console.log(result);
					if(result.data=="No existe correo igual"){

						$scope.mensajeBasico('Error','No se encontro un usuario con este correo','button-balanced');
						$scope.recuperarPass.email='';
					}else if(result.data=="Existe un correo igual"){
						AuthService.recuperarContraseña($scope.recuperarPass.email);
						$scope.mensajeBasico('Exito','Se envio un mensaje al correo con la informacion para recuperar la contraseña','button-balanced');
						cotizadorModelService.cambiarVista('login',true);
					}
				}, 
				function(err) {
					console.log(err);
					$scope.mensajeBasico('Error','Ocurrio el siguiente error:'+err,'button-balanced');
				}
				);
		}
	};


})

.controller('cambiarPasswordCtrl', function($scope,AuthService,$ionicPopup,$stateParams,$state,$ionicHistory,$q,$ionicLoading) {
	$scope.tokenpass = $stateParams.tokenpass;
	$scope.newPassword={password:'',repassword:''};
	$scope.show = function() {
		$ionicLoading.show({
			template: 'Cargando...'
		})
	};
	$scope.hide = function() {
		$ionicLoading.hide();
	};
	$scope.mensajeBasico=function(encabezado,mensaje,tipoBoton){
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
	};
	$scope.intentarCambioPassword=function(){
		if($scope.newPassword.password==$scope.newPassword.repassword){
			var info={tokenPass:$scope.tokenpass,newPassword:$scope.newPassword.password};
			$scope.show();
			AuthService.intentarCambioPass(info).then(
				function(response){ 	
					response.data = response.data.replace(/(\r\n|\n|\r)/gm,"");
					console.log(response);				
					if(response=='Se cambio password'){
						cotizadorModelService.hideLoading();
						cotizadorModelService.hideLoading();
						$scope.mensajeBasico('Exito','La contraseña se ha cambiado con exito','button-balanced');						
						cotizadorModelService.cambiarVista('login',true);
					}else if(response=='No existe token'){
						cotizadorModelService.hideLoading();
						$scope.mensajeBasico('Error','Ocurrio un error, intenta de nuevo','button-balanced');
						cotizadorModelService.cambiarVista('recuperarPassword',true);
					}else if(response=='Token caducado'){
						cotizadorModelService.hideLoading();
						$scope.mensajeBasico('Error','La solicitud caduco, intenta de nuevo','button-balanced');
						cotizadorModelService.cambiarVista('recuperarPassword',true);
						
					}else if(response=='Error'){
						cotizadorModelService.hideLoading();
						$scope.mensajeBasico('Error','Ocurrio un error, intenta de nuevo','button-balanced');
						cotizadorModelService.cambiarVista('recuperarPassword',true);
					}					

				},
				function(err){
					cotizadorModelService.hideLoading();
					console.log(err);
					$scope.mensajeBasico('Error','Ocurrio el siguiente error:'+err,'button-balanced');
				})

		}else{
			$scope.newPassword={password:'',repassword:''};
			$scope.mensajeBasico('Error','Las contraseñas no coinciden, intentalo de nuevo','button-balanced')
		}
	}

})