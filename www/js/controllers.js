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
		//cotizadorModelService.initUserData();  

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

	$scope.removeProspect=function(prospecto_id){
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
					cotizadorModelService.removeProspect(prospecto_id).
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

	$scope.editarProspecto=function(prospecto_id){
		cotizadorModelService.editarProspecto(prospecto_id);
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
		if( cotizadorModelService.isEmpty($scope.infoProspecto.razonSocial)
			){
			cotizadorModelService.mensajeBasico('Error','Debe existir una razon social, adicionalmente el email debe tener arroba','button-balanced');
			
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
	//console.log("hola");	
	$scope.required = true;
	$scope.nuevoProspecto={
		razonSocial:"",
		nit:"",
		direccion:"",
		email:"",
		telefono:""
	};

	$scope.agregarNuevoProspecto=function(){
		if( cotizadorModelService.isEmpty($scope.nuevoProspecto.razonSocial)){

			var errorEmptyAlert=$ionicPopup.alert({
				title: 'Campos Vacios',
				template: 'Se debe agregar una razon social',
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

.controller('cotizacionesCtrl', function($scope,$ionicPopup,cotizadorModelService,$state,$ionicHistory,$cordovaToast) {
	//inicialziar al abrir la pestaña de cotizaciones. Cargar prospectos y crear un procesosUsuariolimpio	
		
	//$scope.orientacion=cotizadorModelService.orientacionFunction();
	
	$scope.orientacion="portrait";
 	
	$scope.prospectosUsuario= cotizadorModelService.getProspectos();
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

	}else{
		$scope.procesosUsuario= cotizadorModelService.getProcesos();
		var tarifasProcesos;
		cotizadorModelService.getTarifasProcesos().
			then(function(datos) {
				//Fconsole.log(datos);
				if(datos.estado=='200'){
					tarifasProcesos=angular.fromJson(datos.tarifas);
					tarifasProcesos=tarifasProcesos.tarifas;
					//console.log(tarifasProcesos);
				}else{
					cotizadorModelService.hideLoading();
					cotizadorModelService.mensajeBasico('Error','Ocurrio un error, intentalo mas tarde','button-balanced');
					cotizadorModelService.cambiarVista('app.inicio',true);
				}
		});
		
		backfromcalcular= cotizadorModelService.getBackFromCalcular();

		if(backfromcalcular){
			$scope.procesosCotizacion=cotizadorModelService.getProcesosActivos();
			$scope.opcionesSeleccionadas=cotizadorModelService.getOpcionesSeleccionadas();
			$scope.requisitosCot=$scope.opcionesSeleccionadas.requisitos;
			$scope.totalCotizacion=0;
			//console.log($scope.procesosCotizacion);
			for(var i=0; i<$scope.procesosCotizacion.length;i++){
				$scope.totalCotizacion+=$scope.procesosCotizacion[i].costo_total;		
			}

		}else{
			cotizadorModelService.inicializarTemporales();
			$scope.opcionesSeleccionadas={
				prospectoSeleccionado: null,
				formaPago:null,
				nombre_producto:null,
				tiempo_entrega:null,
				requisitos:null
			};			
			$scope.requisitosCot=[{'valor':""}];
			//$scope.imgs=[{'url':""}];
			$scope.totalCotizacion=0;
			$scope.procesosCotizacion=[
			{
				"id_proceso":"1",
				"nombre":"Modelado",
				"hide":true,
				"procesos":[],
			},
			{
				"id_proceso":"2",
				"nombre":"Arte",
				"hide":true,
				"procesos":[],
			},
			{
				"id_proceso":"3",
				"nombre":"Rig",
				"hide":true,
				"procesos":[],
			},
			{
				"id_proceso":"4",
				"nombre":"Animacion",
				"hide":true,
				"procesos":[],
			},
			{
				"id_proceso":"5",
				"nombre":"Iluminacion",
				"hide":true,
				"procesos":[],
			},
			{
				"id_proceso":"6",
				"nombre":"Render",
				"hide":true,
				"procesos":[],
			},
			{
				"id_proceso":"7",
				"nombre":"Postproduccion",
				"hide":true,
				"procesos":[],
			},
			{
				"id_proceso":"8",
				"nombre":"Otros",
				"hide":true,
				"procesos":[],
			}
		];
		//convertir a json el campo de opciones en los procesos
		if(typeof($scope.procesosUsuario[0].opciones)=='string'){		
			for(var i=0; i<$scope.procesosUsuario.length;++i){
				$scope.procesosUsuario[i].opciones=JSON.parse($scope.procesosUsuario[i].opciones);
			}
		}
	}
		}	
		$scope.mostrarToast = function(message) {
			if(ionic.Platform.platform()=='win32'){
				cotizadorModelService.mensajeBasico(message,'','button-balanced');

			}else if(ionic.Platform.platform()=='android'){
				$cordovaToast.show(message, 'short', 'bottom').then(function(success) {
		            console.log("The toast was shown");
		        }, function (error) {
		            console.log("The toast was not shown due to " + error);
		        });

			}else if(ionic.Platform.platform()=='ios'){
				$cordovaToast.show(message, 'short', 'bottom').then(function(success) {
		            console.log("The toast was shown");
		        }, function (error) {
		            console.log("The toast was not shown due to " + error);
		        });

			}else{
				cotizadorModelService.mensajeBasico('Proceso',message,'button-balanced');
			}
	        
	    }
		$scope.cambiarTotal=function(proceso_cc,oldVal,origen_input){
			//console.log(proceso_cc);
			//console.log(oldVal);
			var valorViejo=0;
			var valorNuevo=0;
			//init cuando se agrega un nuevo proceso
			//dificultad cuando se cambia el gauge de dificultad
			//dias cuando se cambia el gauge de dias

			if(origen_input=='init'){

				for(var i=0;i<tarifasProcesos.length;i++){
					if(proceso_cc.dificultad==tarifasProcesos[i].dificultad &&proceso_cc.id_proceso==tarifasProcesos[i].id_proceso){
						valorNuevo=tarifasProcesos[i].costo_dia*Number(proceso_cc.dias);
					}
				}
				$scope.totalCotizacion=$scope.totalCotizacion+valorNuevo;
						
			}else if(origen_input=='end'){

				for(var i=0;i<tarifasProcesos.length;i++){
					if(proceso_cc.dificultad==tarifasProcesos[i].dificultad &&proceso_cc.id_proceso==tarifasProcesos[i].id_proceso){
						if(proceso_cc.tipo_intervalo=='dia'){
							valorViejo=tarifasProcesos[i].costo_dia*Number(proceso_cc.dias);
						}else{
							valorViejo=tarifasProcesos[i].costo_mes*Number(proceso_cc.dias);
						}
						console.log(valorNuevo);
					}
				}
				$scope.totalCotizacion=$scope.totalCotizacion-valorViejo;
						
			}
			else if(origen_input=='dificultad'){
				for(var i=0;i<tarifasProcesos.length;i++){
					if(oldVal==tarifasProcesos[i].dificultad &&proceso_cc.id_proceso==tarifasProcesos[i].id_proceso){
						valorViejo=tarifasProcesos[i].costo_dia*Number(proceso_cc.dias);
					}
				}

				for(var i=0;i<tarifasProcesos.length;i++){
					if(proceso_cc.dificultad==tarifasProcesos[i].dificultad &&proceso_cc.id_proceso==tarifasProcesos[i].id_proceso){
						valorNuevo=tarifasProcesos[i].costo_dia*Number(proceso_cc.dias);
					}
				}
				$scope.totalCotizacion=$scope.totalCotizacion-valorViejo;
				$scope.totalCotizacion=$scope.totalCotizacion+valorNuevo;
						
			}else if(origen_input=='dias'){
				console.log(oldVal);
				for(var i=0;i<tarifasProcesos.length;i++){
					if(proceso_cc.dificultad==tarifasProcesos[i].dificultad &&proceso_cc.id_proceso==tarifasProcesos[i].id_proceso){
						valorViejo=tarifasProcesos[i].costo_dia*oldVal;
					}
				}

				for(var i=0;i<tarifasProcesos.length;i++){
					if(proceso_cc.dificultad==tarifasProcesos[i].dificultad &&proceso_cc.id_proceso==tarifasProcesos[i].id_proceso){
						valorNuevo=tarifasProcesos[i].costo_dia*Number(proceso_cc.dias);
					}
				}
				$scope.totalCotizacion= $scope.totalCotizacion-valorViejo;
				$scope.totalCotizacion= $scope.totalCotizacion+valorNuevo;
				
			}else if(origen_input=='tipo_intervalo'){
				for(var i=0;i<tarifasProcesos.length;i++){
					if(proceso_cc.dificultad==tarifasProcesos[i].dificultad &&proceso_cc.id_proceso==tarifasProcesos[i].id_proceso){
						if(oldVal=='dia'){
							valorViejo=tarifasProcesos[i].costo_dia*Number(proceso_cc.dias);
						}else if(oldVal=='mes'){
							valorViejo=tarifasProcesos[i].costo_mes*Number(proceso_cc.dias);
						}					
					}
				}

				for(var i=0;i<tarifasProcesos.length;i++){
					if(proceso_cc.dificultad==tarifasProcesos[i].dificultad &&proceso_cc.id_proceso==tarifasProcesos[i].id_proceso){
						if(oldVal=='dia'){
							valorNuevo=tarifasProcesos[i].costo_mes*Number(proceso_cc.dias);
						}else if(oldVal=='mes'){
							valorNuevo=tarifasProcesos[i].costo_dia*Number(proceso_cc.dias);
						}	
					}
				}
				$scope.totalCotizacion= $scope.totalCotizacion-valorViejo;
				$scope.totalCotizacion= $scope.totalCotizacion+valorNuevo;
			}
		}			
		
	

	$scope.decrecerValor=function(proceso,tipo){
		if(tipo==0){// proceso.dias
			if( parseInt(proceso.dias)>1){
				var valorAntiguo=parseFloat(proceso.dias);
				proceso.dias= parseFloat(proceso.dias)-0.1;
				proceso.dias=proceso.dias.toFixed(1);
				$scope.cambiarTotal(proceso,valorAntiguo,'dias');
			}
		}else if(tipo==1){ //proceso.dificultad
			if( parseInt(proceso.dificultad)>1 ){
				var valorAntiguo=parseFloat(proceso.dificultad);
				proceso.dificultad=parseInt(proceso.dificultad)-1;
				$scope.cambiarTotal(proceso,valorAntiguo,'dificultad');	
			}
		}
	}

	$scope.aumentarValor=function(proceso,tipo){
		if(tipo==0){// proceso.dias
			if( parseInt(proceso.dias)<100){	
				var valorAntiguo=parseFloat(proceso.dias);			
				proceso.dias= parseFloat(proceso.dias)+0.1;				
				proceso.dias=proceso.dias.toFixed(1);
				$scope.cambiarTotal(proceso,valorAntiguo,'dias');
			}
			
		}else if(tipo==1){ //proceso.dificultad
			if( parseInt(proceso.dificultad)<3){
				var valorAntiguo=parseFloat(proceso.dificultad);
				proceso.dificultad=parseInt(proceso.dificultad)+1;
				$scope.cambiarTotal(proceso,valorAntiguo,'dificultad');
			}
		}
	}
		
	$scope.agregarRequerimiento=function(){
		$scope.requisitosCot.push({'value':""});
		//console.log($scope.requisitosCot);
	}

	$scope.quitarRequerimiento=function(index){
		//console.log($scope.requisitosCot);
		if($scope.requisitosCot.length>1){
			$scope.requisitosCot.splice(index,1);

		}else{
			cotizadorModelService.mensajeBasico('Aviso','Debe existir minimo un requerimiento','button-balanced');
		}	
	}
	$scope.agregarImg=function(){
		console.log($scope.imgs);
		if($scope.imgs.length<3){
			$scope.imgs.push({'url':""});
		}else{
			cotizadorModelService.mensajeBasico('Aviso','Se permiten maximo 3 imagenes','button-balanced');
		}
	}

	$scope.quitarImg=function(index){
		$scope.imgs[index].url="";
		
		$scope.imgs.splice(index,1);
	}


	$scope.removeProcess=function(id_proceso,index){
		console.log('hola');
		for (var i = 0; i < $scope.procesosCotizacion.length ; ++i) {
			if($scope.procesosCotizacion[i].id_proceso == id_proceso){
				//console.log($scope.procesosCotizacion[i]);
				//console.log($scope.procesosCotizacion[i].procesos[index]);
				$scope.cambiarTotal($scope.procesosCotizacion[i].procesos[index],0,'end');
				$scope.procesosCotizacion[i].procesos.splice(index,1);
			}
		}
	}
	$scope.addProcess=function(id){
		for (var i = 0; i < $scope.procesosUsuario.length ; ++i) {
			if($scope.procesosUsuario[i].id_proceso == id){
				//console.log($scope.procesosUsuario[i]);
				if($scope.procesosUsuario[i].opciones[0].tipo=="empty"){
					var temp2={
						hide:true,
						tipo:$scope.procesosUsuario[i].opciones[0].tipo,
						valorEscogido:$scope.procesosUsuario[i].opciones[0].valorEscogido,
						valores:$scope.procesosUsuario[i].opciones[0].valores,
					};
				}else{
					var temp2={
						hide:false,
						tipo:$scope.procesosUsuario[i].opciones[0].tipo,
						valorEscogido:$scope.procesosUsuario[i].opciones[0].valorEscogido,
						valores:$scope.procesosUsuario[i].opciones[0].valores,
					};
				}
				//console.log(temp2);

				var temp={
					dias:50,
					dias_max:100,
					dias_min:1,
					dificultad:1,
					hide:false,
					id_proceso:$scope.procesosUsuario[i].id_proceso,
					img:$scope.procesosUsuario[i].img,
					nombre:$scope.procesosUsuario[i].nombre,
					opciones:temp2,
					tipo_intervalo:"dia",
				}

				if($scope.procesosUsuario[i].id_proceso=="1"){									
					$scope.procesosCotizacion[0].procesos.push(temp);
					$scope.cambiarTotal($scope.procesosUsuario[i],0,'init');
					
				}
				else if($scope.procesosUsuario[i].id_proceso=="2"){
					$scope.procesosCotizacion[1].procesos.push(temp);
					$scope.cambiarTotal($scope.procesosUsuario[i],0,'init');
				}
				else if($scope.procesosUsuario[i].id_proceso=="3"){
					$scope.procesosCotizacion[2].procesos.push(temp);
					$scope.cambiarTotal($scope.procesosUsuario[i],0,'init');
				}				
				else if($scope.procesosUsuario[i].id_proceso=="4"){
					$scope.procesosCotizacion[3].procesos.push(temp);
					$scope.cambiarTotal($scope.procesosUsuario[i],0,'init');
				}
				else if($scope.procesosUsuario[i].id_proceso=="5"){
					$scope.procesosCotizacion[4].procesos.push(temp);
					$scope.cambiarTotal($scope.procesosUsuario[i],0,'init');
				}
				else if($scope.procesosUsuario[i].id_proceso=="6"){
					$scope.procesosCotizacion[5].procesos.push(temp);
					$scope.cambiarTotal($scope.procesosUsuario[i],0,'init');
				}					
				else if($scope.procesosUsuario[i].id_proceso=="7"){
					$scope.procesosCotizacion[6].procesos.push(temp);
					$scope.cambiarTotal($scope.procesosUsuario[i],0,'init');
				}
				else if($scope.procesosUsuario[i].id_proceso=="8"){
					$scope.procesosCotizacion[7].procesos.push(temp);
					$scope.cambiarTotal($scope.procesosUsuario[i],0,'init');
				}
				
			}
		}
		console.log($scope.procesosCotizacion[0]);
	}

	$scope.calcularItems=function(){
		$scope.opcionesSeleccionadas.requisitos=$scope.requisitosCot;
		var flag=0;
		//RECORRE EL ARRAY DE PROCESOS PARA COMPROBAR QUE EXISTEN PROCESOS AGREGADOS
		for (var i = 0; i < $scope.procesosCotizacion.length ; ++i) {
			if($scope.procesosCotizacion[i].procesos.length>0){
				flag=1;
			}
		}
		if(flag == 1 && $scope.opcionesSeleccionadas.prospectoSeleccionado != null 
			&& $scope.opcionesSeleccionadas.formaPago != null && $scope.opcionesSeleccionadas.nombre_producto != null
			&& $scope.opcionesSeleccionadas.tiempo_entrega != null&& $scope.opcionesSeleccionadas.requisitos != null
			&& $scope.opcionesSeleccionadas.requisitos[0].valor != ""){

			$scope.opcionesSeleccionadas.prospectoSeleccionado= $scope.opcionesSeleccionadas.prospectoSeleccionado.id_prospecto;
			
			cotizadorModelService.setProcesosActivos($scope.procesosCotizacion);
			cotizadorModelService.setOpcionesSeleccionadas($scope.opcionesSeleccionadas);
			cotizadorModelService.setTarifas(tarifasProcesos);
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
	console.log($scope.cotizacionesProspectos);
	//console.log($scope.cotizacionesProspectos);

	$scope.mostrarToast = function(message) {
			if(ionic.Platform.platform()=='win32'){
				cotizadorModelService.mensajeBasico(message,'','button-balanced');

			}else if(ionic.Platform.platform()=='android'){
				$cordovaToast.show(message, 'short', 'bottom').then(function(success) {
		            console.log("The toast was shown");
		        }, function (error) {
		            console.log("The toast was not shown due to " + error);
		        });

			}else if(ionic.Platform.platform()=='ios'){
				$cordovaToast.show(message, 'short', 'bottom').then(function(success) {
		            console.log("The toast was shown");
		        }, function (error) {
		            console.log("The toast was not shown due to " + error);
		        });

			}else{
				cotizadorModelService.mensajeBasico('Proceso',message,'button-balanced');
			}
	        
	    }

	$scope.eliminarCotizacion=function(id_prospecto,id_cotizacion){
		//console.log(id);
		var confirmPopup = $ionicPopup.confirm({
			title: 'Eliminar Cotizacion',
			template: '¿Está seguro que quiere eliminar esta cotizacion?',
			buttons: [
			{text: 'Cancelar',type: 'button-balanced'},
			{
				text: '<b>Ok</b>',
				onTap: function(e) {

					cotizadorModelService.showLoading('Cargando...');
					cotizadorModelService.eliminarCotizacion(id_prospecto,id_cotizacion).
					then(function(data) {
						console.log(data);
						cotizadorModelService.hideLoading();
						if(data.estado=='200'){
							cotizadorModelService.mensajeBasico('Exito',data.msj,'button-balanced');
							$scope.cotizacionesProspectos=cotizadorModelService.getCotizaciones();		
						}else if(data.estado=='500'){
							cotizadorModelService.mensajeBasico('Error',data.msj+',intenta de nuevo.','button-balanced');
						}else if(data.estado=='200'){
							cotizadorModelService.mensajeBasico('Error','No se encontro sesion activa, ingresa de nuevo','button-balanced');
							
							AuthService.logout();							
							cotizadorModelService.cambiarVista('login',true);
						}
					});
				}
			}]
		});
	};

	$scope.archivar=function(id_prospecto,id_cotizacion){
		//console.log(id);
		var confirmPopup = $ionicPopup.confirm({
			title: 'Archivar Cotizacion',
			template: '¿Está seguro que quiere archivar esta cotizacion?',
			buttons: [
			{text: 'Cancelar',type: 'button-balanced'},
			{
				text: '<b>Ok</b>',
				onTap: function(e) {

					cotizadorModelService.showLoading('Cargando...');
					cotizadorModelService.archivarCotizacion(id_prospecto,id_cotizacion).
					then(function(data) {
						console.log(data);
						cotizadorModelService.hideLoading();
						if(data.estado=='200'){
							cotizadorModelService.mensajeBasico('Exito',data.msj,'button-balanced');
							$scope.cotizacionesProspectos=cotizadorModelService.getCotizaciones();		
						}else if(data.estado=='500'){
							cotizadorModelService.mensajeBasico('Error',data.msj+',intenta de nuevo.','button-balanced');
						}else if(data.estado=='200'){
							cotizadorModelService.mensajeBasico('Error','No se encontro sesion activa, ingresa de nuevo','button-balanced');
							
							AuthService.logout();							
							cotizadorModelService.cambiarVista('login',true);
						}
					});
				}
			}]
		});
		
	}

	$scope.descargarpdf=function(cotizacionNueva){
		cotizadorModelService.descargarPDF(cotizacionNueva);

	};		
})  

.controller('archivadasCtrl', function($scope,cotizadorModelService,$ionicPopup) {

})


.controller('calcularCtrl', function($scope,$ionicLoading,$q,$ionicPopup,cotizadorModelService,$state,$ionicHistory,$timeout) {
	$scope.myGoBack=function(){
		 $ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go('app.cotizaciones');
	};

	var tarifasProcesos;
	$scope.procesosCotizacion=null;
	$scope.opcionesSeleccionadas=null;
	cotizadorModelService.showLoading('Cargando...');

	$scope.totales={
		produccion:0,
		fijos:0,
		financiacion:0,
		totalProduccion:0,
		precioSinIva:0,
		precioConIva:0

	}
	$scope.margenesPorcentuales={
		costosFijos:100,
		markUp:20,
		margen:0,
		iva:0.19

	}

	$scope.recalcularTotales= function(origen_input){
		if($scope.margenesPorcentuales.markUp==undefined){
			$scope.margenesPorcentuales.markUp=0;
		}if($scope.totales.financiacion==undefined){
			$scope.margenesPorcentuales.financiacion=0;
		}
		if(origen_input=='markup'){
			$scope.totales.precioSinIva=$scope.totales.totalProduccion*(($scope.margenesPorcentuales.markUp/100)+1);
			$scope.totales.precioConIva=$scope.totales.precioSinIva*($scope.margenesPorcentuales.iva+1);
			$scope.margenesPorcentuales.margen=($scope.totales.precioSinIva-$scope.totales.totalProduccion)/$scope.totales.precioSinIva;
		}
		else if(origen_input=='fijos'){
			$scope.totales.fijos=$scope.totales.produccion*($scope.margenesPorcentuales.costosFijos/100);
			$scope.totales.totalProduccion=$scope.totales.produccion+$scope.totales.fijos+$scope.totales.financiacion;
			$scope.totales.precioSinIva=$scope.totales.totalProduccion*(($scope.margenesPorcentuales.markUp/100)+1);
			$scope.totales.precioConIva=$scope.totales.precioSinIva*($scope.margenesPorcentuales.iva+1);
			$scope.margenesPorcentuales.margen=($scope.totales.precioSinIva-$scope.totales.totalProduccion)/$scope.totales.precioSinIva;
		}
		else if(origen_input=='financiacion'){
			$scope.totales.totalProduccion=$scope.totales.produccion+$scope.totales.fijos+$scope.totales.financiacion;
			$scope.totales.precioSinIva=$scope.totales.totalProduccion*(($scope.margenesPorcentuales.markUp/100)+1);
			$scope.totales.precioConIva=$scope.totales.precioSinIva*($scope.margenesPorcentuales.iva+1);
			$scope.margenesPorcentuales.margen=($scope.totales.precioSinIva-$scope.totales.totalProduccion)/$scope.totales.precioSinIva;
		}
	}

	//TRAER PROCESOS ACTIVOS DESDE COTIZACIONES
	//TRAER OPCIONES DESDE COTIZACIONES
	$scope.procesosCotizacion=cotizadorModelService.getProcesosActivos();
	$scope.opcionesSeleccionadas=cotizadorModelService.getOpcionesSeleccionadas();	
	tarifasProcesos=cotizadorModelService.getDetalleTarifas();

	var procesosCotizacionServidor=[];

	


	//VER SI ESTA VACIO PROCESOS ACTIVOS Y OPCIONES SELECCIONADAS
	if(!cotizadorModelService.isEmpty($scope.procesosActivos) || 
		!cotizadorModelService.isEmpty($scope.opcionesSeleccionadas)){
		//COPIAR A UNA VARIABLE TEMPORAL PARA ENVIAR AL SERVIDOR LOS PROCESOS		
		//ENVIAR PROCESOS Y RECIBIR COSTO		

		cotizadorModelService.hideLoading();

		//console.log($scope.procesosCotizacion);
		$scope.opcionesSeleccionadas.hide=true;
		$scope.hideProc={'hide':true};

		for(var i=0;i<$scope.procesosCotizacion.length;i++){
			$scope.procesosCotizacion[i].tiempo_total=0;
			$scope.procesosCotizacion[i].costo_total=0;		
			for(var j=0;j<$scope.procesosCotizacion[i].procesos.length;j++){
				$scope.procesosCotizacion[i].procesos[j].costo_individual=0;
				var costoIndividual=0;
				//COMPARAR INTERVALO Y SUMAR
				if($scope.procesosCotizacion[i].procesos[j].tipo_intervalo=='dia'){
					$scope.procesosCotizacion[i].tiempo_total+=$scope.procesosCotizacion[i].procesos[j].dias;
				}else{
					$scope.procesosCotizacion[i].tiempo_total+=$scope.procesosCotizacion[i].procesos[j].dias*30;
				}
				//ENCONTRAR COSTO INDIVIDUAL Y SUMARLO AL COSTO TOTAL

				for(var k=0;k<tarifasProcesos.length;k++){
					if($scope.procesosCotizacion[i].procesos[j].dificultad==tarifasProcesos[k].dificultad 
						&& $scope.procesosCotizacion[i].procesos[j].id_proceso==tarifasProcesos[k].id_proceso){
						if($scope.procesosCotizacion[i].procesos[j].tipo_intervalo=='dia'){
							costoIndividual=tarifasProcesos[k].costo_dia*Number($scope.procesosCotizacion[i].procesos[j].dias);
						}else if($scope.procesosCotizacion[i].procesos[j].tipo_intervalo=='mes'){
							costoIndividual=tarifasProcesos[k].costo_mes*Number($scope.procesosCotizacion[i].procesos[j].dias);
						}					
					}
				}
				console.log(costoIndividual);
				$scope.procesosCotizacion[i].procesos[j].costo_individual=costoIndividual;
				$scope.procesosCotizacion[i].costo_total+=costoIndividual;
			}		
			
		}
		console.log($scope.procesosCotizacion);
		for(var i=0;i<$scope.procesosCotizacion.length;i++){
			$scope.totales.produccion+=$scope.procesosCotizacion[i].costo_total;
		}
		$scope.totales.fijos=$scope.totales.produccion*($scope.margenesPorcentuales.costosFijos/100);
		$scope.totales.totalProduccion=$scope.totales.produccion+$scope.totales.fijos+$scope.totales.financiacion;
		$scope.totales.precioSinIva=$scope.totales.totalProduccion*(($scope.margenesPorcentuales.markUp/100)+1);
		$scope.totales.precioConIva=$scope.totales.precioSinIva*($scope.margenesPorcentuales.iva+1);
		$scope.margenesPorcentuales.margen=($scope.totales.precioSinIva-$scope.totales.totalProduccion)/$scope.totales.precioSinIva;

			//console.log($scope.procesosCotizacion);
		var d= new Date();
		var cotizacionNueva={
			"id_cotizacion":null,
			"fecha":d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate(),
			"costos_fijos":$scope.margenesPorcentuales.costosFijos,
			"financiacion":$scope.totales.financiacion,
			"markup":$scope.margenesPorcentuales.markUp,
			"costo_total":$scope.totales.precioSinIva,
			"procesosCotizacion":$scope.procesosCotizacion,
			"opcionesCotizacion":$scope.opcionesSeleccionadas,
			"estado":true,
			"hide":false
		};
		console.log(cotizacionNueva);
		$scope.guardarCotizacion= function(){
			//console.log($scope.opcionesSeleccionadas.prospectoSeleccionado.id);
			cotizadorModelService.showLoading('Cargando...');
			cotizadorModelService.agregarNuevaCotizacion(cotizacionNueva).
				then(function (response) {
					cotizadorModelService.hideLoading();
					//console.log(response);
					if(response.estado=='200'){
						cotizadorModelService.mensajeBasico('Exito','Se agrego exitosamente la cotizacion','button-balanced');
						cotizadorModelService.inicializarTemporales();
						cotizadorModelService.cambiarVista('app.listaDeCotizaciones',true);
					}else if(response.estado=='500'){
						cotizadorModelService.mensajeBasico('Error','No se agrego la cotizacion,intentalo mas tarde','button-balanced');
					}               
					
	            }, function(error) {
	            	cotizadorModelService.hideLoading();
	                cotizadorModelService.mensajeBasico('Error','Ocurrio el siguiente error:'+error.message,'button-balanced');
	            });			

		}
		$scope.exportarCotizacion= function(){
			//Enviar parametros para generar pdf
			cotizadorModelService.showLoading('Cargando...');
			cotizadorModelService.agregarNuevaCotizacion(cotizacionNueva).
				then(function (response) {
					cotizadorModelService.hideLoading();
					console.log(response);
					if(response.estado=='200'){
						cotizadorModelService.descargarPDF(cotizacionNueva);
						cotizadorModelService.mensajeBasico('Exito','Se agrego exitosamente la cotizacion,','button-balanced');
						cotizadorModelService.inicializarTemporales();
						cotizadorModelService.cambiarVista('app.listaDeCotizaciones',true);
					}else if(response.estado=='500'){
						cotizadorModelService.mensajeBasico('Error','No se agrego la cotizacion,no se puede descargar,intentalo de nuevo','button-balanced');
					}               
					
	            }, function(error) {
	            	cotizadorModelService.hideLoading();
	                cotizadorModelService.mensajeBasico('Error','Ocurrio el siguiente error:'+error.message,'button-balanced');
	            });	

			

		}
		$scope.cancelarCotizacion= function(){
			//Enviar parametros para generar pdf
			var confirmPopup = $ionicPopup.confirm({
				title: 'Atencion',
				template: '¿Borrar esta cotizacion? Para editar presione el boton atras',
				buttons: [
				{ 
					text: 'Cancelar' 
				},
				{
					text: '<b>Ok</b>',
					type: 'button-dark',
					onTap: function(e) {					
						cotizadorModelService.inicializarTemporales();
						cotizadorModelService.cambiarVista('app.cotizaciones',true);
					}
				}
				]
			});

		}
		

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
				//console.log($scope.credenciales);
				AuthService.login($scope.credenciales).
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
					$scope.mensajeBasico('Error en la conexion con el servidor',err.msj,'button-balanced');
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
										$state.go('inicio');
									}else if(result.data=="Error"){
										//console.log(result);
										//console.log(result.data);
										$scope.hide();
										$scope.mensajeBasico('Error','Ocurrio un error inesperado, intentalo de nuevo','button-balanced');
									}
								},
								function(err) {
									//console.log('hola');
									$scope.mensajeBasico('Error','Ocurrio un error inesperado'+err,'button-balanced');
							});
						}else if(result.data=="Existe un correo igual"){
							//console.log('hola');
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