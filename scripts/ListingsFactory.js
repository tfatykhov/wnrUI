(function(){

    'use strict';

    angular
        .module('HomeReadyApp')
        .factory('ListingsFactory', ListingsFactory);	
   
            function ListingsFactory($http,NgMap) {
                return {
                	getMlsListings : getMLS
                	,getHopepathListings : getHP
                };

                
                
                function getHP(area,clusterer,listingList){
                    var req = {
                    		cache : false,
                            method: 'POST',
                            url: '/hr/homepath',
                            headers :{
                                'Cache-Control': 'no-cache'
                            },
                            data:area
                        }
                       return $http(req).then(function(response){
                    	   console.log('getting HomePath from '+req.url);
 /*                   	   console.log(response.data);*/
                    	   angular.forEach(response.data.listings, function(value){
                    		   createHPMarker(value,clusterer,listingList); 
                    	   });
                    	   },
                    	   function(response){
                    		   console.log('url: '+req.url+' error '+JSON.stringify(response));
                    });                	
                }
                               
                function getMLS(area,clusterer,listingList){
                    var req = {
                    		cache : false,
                            method: 'POST',
                            url: '/hr/listings',
                            headers :{
                                'Cache-Control': 'no-cache'
                            },
                            data:area
                        }
                       return $http(req).then(function(response){
                    	   console.log('getting MLS from '+req.url);
/*                    	   console.log(response.data);*/
                    	   angular.forEach(response.data, function(value){
                    		  createMLSMarker(value,clusterer,listingList); 
                    	   });
                    	   },
                    	   function(response){
                    		   console.log('url: '+req.url+' error '+JSON.stringify(response));
                    });
               	
                };
                
                function createHPMarker(listing,clusterer,listingList){

/*            		o.app = app;
            		o.data = data;
            		o.tab = null;
            		o.gallery = null;
            		o.row = null;*/
            		var point = new google.maps.LatLng(listing.geocode.latitude,listing.geocode.longitude);
/*            		o.lid = d.mls_number;*/

            		// clean numeric data
/*            		o.data.price = parseInt(o.data.price);
            		o.data.sqft = parseInt(o.data.sqft);
            		o.data.bedrooms = parseFloat(o.data.bedrooms);
            		o.data.bathrooms = parseFloat(o.data.bathrooms);
            		o.data.url = o.data.links[0].href || '';*/

            		// marker
            		var marker = new google.maps.Marker({
            			position:point,
            			label:{
            				text: 'H',
            				fontSize: '12px'
            			},
            			icon:{
            				labelOrigin: new google.maps.Point(16,12),
            				url: 'images/markers/map-marker-2-32_purple.png'
            			}
            		});
            		listingList.push({data:listing,marker:marker});
            		clusterer.addMarker(marker,true);
                }
                
                function createMLSMarker(listing,clusterer,listingList){
/*            		o.app = app;
            		o.data = data;
            		o.tab = null;
            		o.gallery = null;
            		o.row = null;
            		o.lat = d.lat;
            		o.lng = d.lng;*/
            		var point = new google.maps.LatLng(listing.lat,listing.lng);
            		//o.lid = d.id;

            		// marker
            		var marker = new google.maps.Marker({
            			position:point,
            			label:{
            				text: (listing.catg.toLowerCase()=='rent') ? 'R' : 'P',
            				fontSize: '12px'
            			},
            			icon:{
            				labelOrigin: new google.maps.Point(16,12),
            				url: 'images/markers/map-marker-2-32_blue.png'
            					//(d.catg.toLowerCase()=='rent') ? 'http://maps.google.com/mapfiles/ms/icons/yellow.png' : 'http://maps.google.com/mapfiles/ms/icons/green.png'
            			}
            		});
            		listingList.push({data:listing,marker:marker});
            		clusterer.addMarker(marker,true);
                }
                                
            };        
})();