.controller('calcularCtrl', function($scope,$ionicLoading,$ionicPopup,cotizadorModelService,$state,$ionicHistory,$timeout) {
	$scope.procesosCotizacion=[];
	$scope.show = function() {
		$ionicLoading.show({
			template: 'Loading...'
		})
	};
	$scope.hide = function() {
		$ionicLoading.hide();
	};

	$scope.show();

	$scope.totalCotizacion=0;
	$scope.tarifas=cotizadorModelService.getTarifas();
	//console.log(angular.toJson($scope.tarifas));
	$scope.procesosActivos=cotizadorModelService.getProcesosActivos();
	$scope.opcionesSeleccionadas=cotizadorModelService.getOpcionesSeleccionadas();
	console.log(cotizadorModelService.getProcesosActivos());
	console.log(cotizadorModelService.getBackFromCalcular());

	//$scope.prospectoCotizacion=cotizadorModelService.getProspectoCotizacionActivo();

	$scope.id_cotizacion=cotizadorModelService.getCotizacionID();

	if(!cotizadorModelService.isEmpty($scope.procesosActivos) || !cotizadorModelService.isEmpty($scope.opcionesSeleccionadas)){
		//console.log("verdadero");

		for(var i=0; i<$scope.procesosActivos.length; ++i){

			//console.log(i);
			for(var j=0; j<$scope.tarifas.length;++j){

				if( $scope.procesosActivos[i].id_proceso==$scope.tarifas[j].id_proceso &&
					$scope.procesosActivos[i].dificultad==$scope.tarifas[j].dificultad)
				{

					var costoProceso=parseInt($scope.tarifas[j].costo_hora) * parseInt($scope.procesosActivos[i].horas);
					//console.log(costoProceso);

					temp={
						id_proceso:$scope.procesosActivos[i].id_proceso,
						nombre:$scope.procesosActivos[i].nombre,
						dificultad:$scope.procesosActivos[i].dificultad,
						esfuerzo:$scope.procesosActivos[i].horas,
						costo:costoProceso,
						opciones:$scope.procesosActivos[i].opciones
					}
					$scope.procesosCotizacion.push(temp);
				}
			}
		}
		//console.log($scope.procesosCotizacion);
		//console.log($scope.procesosCotizacion);		
		//console.log($scope.opcionesSeleccionadas);
		$scope.hide();
		for (var i = $scope.procesosCotizacion.length - 1; i >= 0; i--) {
			$scope.totalCotizacion+=parseInt($scope.procesosCotizacion[i].costo);
		}

		var cotizacionNueva={
			"id_cotizacion":$scope.id_cotizacion,
			"forma_pago":$scope.opcionesSeleccionadas.formaPago,
			"costo_total":$scope.totalCotizacion,
			"procesosCotizacion":$scope.procesosCotizacion,
			"estado":true,
			"hide":false
		};
		console.log(cotizadorModelService.getProcesosActivos());
		$scope.guardarCotizacion= function(){
			console.log($scope.opcionesSeleccionadas.prospectoSeleccionado.id);
			cotizadorModelService.addNewCotizacion($scope.opcionesSeleccionadas.prospectoSeleccionado.id,cotizacionNueva);
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			cotizadorModelService.inicializarTemporales();
			$state.go('app.listaDeCotizaciones');

		}
		$scope.exportarCotizacion= function(){
			var prospecto=cotizadorModelService.getProspectobyID($scope.opcionesSeleccionadas.prospectoSeleccionado.id);
			var fecha = (new Date()).toString().split(' ').splice(1,3).join(' ');

			var procesosPDF= {};
			procesosPDF.ol=[];
			for(var i = 0; i<$scope.procesosCotizacion.length ; i++){
				procesosPDF.ol.push($scope.procesosCotizacion[i].nombre);
				var temp={};
				temp.ul=[];
				temp.ul.push('Dificultad:'+$scope.procesosCotizacion[i].dificultad);
				temp.ul.push('Esfuerzo:'+$scope.procesosCotizacion[i].esfuerzo);
				temp.ul.push('Costo:'+$scope.procesosCotizacion[i].costo);
				procesosPDF.ol.push(temp);

			}
			console.log(procesosPDF);


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
						{ text: 'PROPUESTA', alignment: 'right',fontSize: 22, bold: true }
						]
					}
				},
				content: [

			//SALUDOS
			{	margin: [10,72,10,0],
				columns:[
				{width:100,text:'Señores:', bold: true},
				{width:'*',text:prospecto,alignment:'left'}
				]
			},
			{
				margin: [10,0,10,0],
				columns:[
				{width:100,text:'Fecha:', bold: true},
				{width:'*',text:fecha+'\n\n',alignment:'left'}
				]
			},
			{
				margin: [10,0,10,0],
				columns:[
				{width:100,text:'Producto:', bold: true},
				{width:'*',text:'Titulo de la cotizacion?\n\n',alignment:'left'}
				]
			},
			//DESCRIPCION
			{ text: '\n\nDescripcion\n\n', style: 'subheader' ,margin: [10,0,10,0]},
			procesosPDF,
			//IMPORTANTE
			{ text: '\n IMPORTANTE\n', style: 'subheader',pageBreak: 'before'},
			{ text: '\n\Antes de empezar la producción, el cliente debe entregar lo siguiente\n\n'},
			{
				ul: [
				'BluePrints de cada referencia (Front, Side, Back, Top) ',
				'Fotos y medidas generales de cada accesorio',
				'Lista de combinaciones por automóvil.'
				]
			},
			//TIEMPO DE ENTREGA
			{ text: '\n\TIEMPO DE ENTREGA:\n\n', style: 'subheader' },
			'2 meses calendario después de recibir el material necesario.\n',
			'Al finalizar cada proceso de la producción se pedirá aprobación para continuar.\n',
			'Dependiendo de los tiempos de respuesta, puede variar el tiempo de entrega.\n\n\n',
			//FORMA DE PAGO
			{ text: '\nFORMA DE PAGO:\n\n', style: 'subheader' },
			cotizacionNueva.forma_pago,
			{
				ul: [
				'Banco Davivienda \nCuenta Corriente N. 930062131899 \nMakila Technologies SAS\n NIT. 900506902-6'
				]
			},

			],
			
			footer: [
			{
				style:'footer',
				text:'Makila Technologies S.A.S\n NIT. 900506902-6 \n Cll 118 #52b-21,Bogota\n Contacto +57 304 617 4961'
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
		};
		pdfMake.createPdf(docDefinition).open();
	}

		

	}else{
		//console.log("falso");
		var errorEmptyAlert=$ionicPopup.alert({
			title: 'Ocurrio un eror',
			template: 'No hay procesos activos para calcular o no se han definido opciones',
			buttons: [
			{ 
				text: 'Ok',
				type: 'button-balanced',

			}
			]
		});
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$scope.hide();
		$state.go('app.cotizaciones');
	}

})



