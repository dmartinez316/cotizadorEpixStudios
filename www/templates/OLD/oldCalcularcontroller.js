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