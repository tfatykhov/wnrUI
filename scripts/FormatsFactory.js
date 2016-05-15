(function(){

    'use strict';

    angular
        .module('HomeReadyApp')
        .factory('FormatsFactory', FormatsFactory);
        	
    
            function FormatsFactory(NgMap) {
                return {
                	fmtBsmt  : fmtBsmt,
                	fmtAmt : fmtAmt,
                	fmtLot : fmtLot,
                	n2b : n2b,
                	n2d : n2d,
                	fdol : fdol,
                	kdol : kdol,
                	geom : geom,
                	polyStrokeColor : polyStrokeColor,
                	polyStrokeWeight : polyStrokeWeight,
                	polyFillColor : polyFillColor,
                	polySetType : polySetType
                
                };
            	function fmtBsmt(t,f){var out=''; if(t) out+=t+' total<br>'; if(f) out+=f+' finished'; return out;};
            	
            	function fmtAmt (a,t){if(typeof t==='undefined') return ''; else if (t.toLowerCase()=='rent') return this.fdol(a)+' / mo.'; else return this.kdol(a);};
            	
            	function fmtLot(v)  {if(typeof v==='undefined' || v===null) return '';return Math.round(v*43560,0);};
            	
            	function n2b(v)  {if(typeof v==='undefined' || v===null) return '';return v;};
            	
            	function n2d(v)  {if(typeof v==='undefined' || v===null || v==='') return '.';return v;};
            	
            	function fdol(v)  {
            		if(typeof v==='undefined' || v===null || v==='' || !v) return '';
            		return '$' + parseInt(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            	};
            	
            	function kdol(v)  {if(typeof v==='undefined' || v===null || v==='') return '';return '$' + Math.round(parseInt(v)/1000) + 'K';};

            	// translate WKT geometry string into array of LatLngs.
            	function geom(p){
            		var geom = [];
            		p = p.match(/\(\(([^)]+)\)/)[1];
            		var points = p.split(',');
            		for(var i=0; i<points.length; i++) {
            			var point = points[i].trim().split(' ');
            			geom.push(new google.maps.LatLng(parseFloat(point[1]),parseFloat(point[0])));
            		}
            		return geom;
            	};
            	
            	// Tract Polygon styling
            	function polyStrokeColor(subj){
            		switch(subj){
            		case 'Y':
            			return '#000000';
            			break;
            		default:
            			return '#666666';
            		}
            	};
            	
            	function polyStrokeWeight(subj){
            		switch(subj){
            		case 'Y':
            			return '5';
            			break;
            		default:
            			return '2';
            		}
            	};
            	function polyFillColor(elig){
            		switch(elig){
            		case '100% of AMI':
            			return '#A5C7A5'; // medium green
            			break;
            		case '80% of AMI':
            			return '#00DDDD'; // aqua
            			break;
            		default:
            			return '#33FF33'; // lime green
            		}            		
            	};
            	function polySetType(polygon,type){
	            	if(type=='Normal') {
	            		polygon.setOptions({strokeOpacity: 0.5, strokeWeight: 2.0, strokeColor: '#666666'}); //normal
	            	}
	            	 else {
	            		 polygon.setOptions({strokeOpacity: 1, strokeWeight: 8.0, strokeColor: '#F7FE2E'}); //active
	            	 }
            	 };
            };        
})();