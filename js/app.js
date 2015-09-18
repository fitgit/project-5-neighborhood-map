var markers=[];
var places=[];


var ViewModel = function (){
	koViewModelInstance = this;
	var self=this;
	self.initAutocomplete=function() {
		console.log("1");
		var map = new google.maps.Map(document.getElementById('map'), {
			//needs to be changed to some neutral place. North America may be.
			center: {lat: -33.8688, lng: 151.2195},
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});

		// Create the search box and link it to the UI element.
		console.log("2");
		var input = document.getElementById('pac-input');
		var searchBox = new google.maps.places.SearchBox(input);
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		// Bias the SearchBox results towards current map's viewport.
		map.addListener('bounds_changed', function() {
			console.log("3");
			searchBox.setBounds(map.getBounds());
		});

		function clearMarkers(){
			// Clear out the old markers.
			markers.forEach(function(marker) {
				console.log("5");	
				marker.setMap(null);
			});
			markers = [];
		}	

		searchBox.addListener('places_changed', function() {
			console.log("4");
			places = searchBox.getPlaces();
			console.log("htting places_changed=" + JSON.stringify(places));
			if (places.length == 0) {
				return;
			}
			clearMarkers();
			var bounds = new google.maps.LatLngBounds();
			createMarkers(bounds);
			map.fitBounds(bounds);
		});	


		function createMarkers(bounds) {
			// For each place, get the icon, name and location.
			places.forEach(function(place) {
				console.log("6");	
				var icon = {
					url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
					size: new google.maps.Size(71, 71),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(17, 34),
					scaledSize: new google.maps.Size(25, 25)
				};

			var marker=new google.maps.Marker({
			map: map,
			icon: icon,
			title: place.name,
			draggable:true,
			animation:google.maps.Animation.DROP,
			position: place.geometry.location
			});

			markers.push(marker);

			function getContentString(place){
				var htmlString='<div id="content">'+
				'<div id="siteNotice">'+
				'<h1 id="firstHeading">' + place.name + '</h1>'+
				'</div>'+
				'<div id="bodyContent">'+
				'<h4>Address: ' + place.formatted_address + '</h4>'+
				'<h4>Rating: ' + place.rating + '</h4>' +
				'</div>';
				return htmlString;
			}

			var infowindow = new google.maps.InfoWindow({
				content: getContentString(place),
			});

			function changeColor(marker){
				if ( marker.clicked === true)
					marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
				else
					marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
				if (marker.getAnimation() !== null) {
					marker.setAnimation(null);
				} else {
					marker.setAnimation(google.maps.Animation.BOUNCE);
				}
			}

			function openInfoWindow(place,marker,infowindow){
				var contentString=getContentString(place);
				infowindow.open(map,marker);
			}
			//addressing closure problem with EventListeners
			marker.addListener('click', (function (marker,place,infowindow) {
				return function(){
					marker.clicked=true;
					changeColor(marker);	
					openInfoWindow(place,marker,infowindow);

				};
			})(marker,place,infowindow));

			//event listener that would reset the marker color to red if infoWindow is closed
			infowindow.addListener('closeclick',(function(marker){
				return function(){
					console.log("Gettting into closeclick");
					marker.clicked = false;
					changeColor(marker);
					//map.panTo({lat: 38.9047, lng: -77.0164}); // centers the map when the infoWindow is closed
				}
			})(marker));

			if (place.geometry.viewport) {
			    	// Only geocodes have viewport.
			    	bounds.union(place.geometry.viewport);
			    } else {
			    	bounds.extend(place.geometry.location);
			    }
			}); //each place
        } //createMarkers
			
	} //initAutoComplete

} //ViewModel




ko.applyBindings(new ViewModel());
