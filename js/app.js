/*	Global Variables to be used both by initAutoComplete and VeiwModel methods.
 *  On hind sight, should have made marker a property of the place object, so did not 
 *	have to have the index variable
*/
var markers=[];
var places=[{name:"Taliercios",latitude:40.377301, longitude:-74.091952,index:0},{name:"Sono Sushi Japanese Restaurant",latitude:40.396809, longitude:-74.110285,index:1},{name:"Belford Bistro",latitude:40.416055, longitude:-74.094488,index:2},{name:"New Monmouth Diner",latitude:40.410195, longitude:-74.132247,index:3},{name:"Neelam Exotic Indian Cuisine",latitude:40.396821, longitude:-74.111353,index:4}];
var map;
var infowindow;

/*Method to clear existing Markers */
function clearMarkers(){
	// Clear out the old markers.
	markers.forEach(function(marker) {
		marker.setMap(null);
	});
	markers = [];
}

/* changeColor method changes the color and animation of the marker element that is passed in 
 *	based on the value of marker clicked.
 *	Input: marker
 *	Changes color to Green when marker is clicked, does a bounce animation for 5 secs
 *	Changes color to red on initialization and when infoWindow is closed
*/	
function changeColor(marker){
	if ( marker.clicked === true){
		marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 5000);
	}	
	else  {
		marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
	    if (marker.getAnimation() !== null) 
		 marker.setAnimation(null);
	}
}

/*	opens an infoWindow when a marker is clicked ,displays more information about the point.
 *	Initalizes to place name as title and "loading data...." for slower n/w, until the actual API call
 *	is successful.
 *	calls getLocationData, which does an API call to foursquare data.
*/
function openInfoWindow(place,marker,infowindow){
	var htmlString='<div id="content">'+
	'<div id="siteNotice">'+
	'<h3 id="firstHeading">' + marker.title+ '</h3>'+
	'</div>'+
	'<div id="bodyContent">'+
	'<h5 id="address">Loading data.....</h5>'+
	'<h5 id="phone"></h5>'+
	'<a id="url" href="" target="_blank"></a>' +
	'</div>';

	infowindow.setContent(htmlString);
	map.panTo(marker.getPosition());
	infowindow.open(map,marker);
	getLocationData(marker);
}

/*	The Main function that instantiates a  map object, createsMarker and displays on the screen
*/
function initAutocomplete(){
	console.log("1");
	map = new google.maps.Map(document.getElementById('map'), {
		// center's the map around Middletown,NJ.
		center: {lat: 40.396755, lng: -74.0916184},
		zoom: 13,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
    
    infowindow = new google.maps.InfoWindow();
    /* Create necessary Markers, register the eventListeners on Marker click and infoWindow close
    */
	function createMarkers(bounds) {
		// For each place, get the icon, name and location.
		places.forEach(function(place) {
			console.log("place.name=" + place.name);	
			var icon = {
				url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};
		// create new Marker based on the location data
		var marker=new google.maps.Marker({
			map: map,
			icon: icon,
			title: place.name,
			draggable:true,
			animation:google.maps.Animation.DROP,
			position: new google.maps.LatLng(place.latitude, place.longitude)
		});

		markers.push(marker);

		/*	Registers Listeners for maker click, calls changeColor and openInfoWindow,
		 *	which changes the color of the marker to green,adds animation and opens an InfoWindow
		 *	Also addressing closure problem with EventListeners, with an outer and return functions.
		*/
		marker.addListener('click', (function (marker,place,infowindow) {
			return function(){
				marker.clicked=true;
				changeColor(marker);	
				openInfoWindow(place,marker,infowindow);

			};
		})(marker,place,infowindow));

		/*	Registers eventListener on close of the infoWindow
		 *	This event listener would reset the marker color to red if infoWindow is closed
		*/
		infowindow.addListener('closeclick',(function(marker){
			return function(){
				marker.clicked = false;
				changeColor(marker);
			}
		})(marker));

		/* Had this in place when I had dynamic search initially , doing searchbox.getPlaces.
		 *	Will leave it in, incase I have the time to make the location data dynamic.
		if (place.geometry.viewport) {
		    	// Only geocodes have viewport.
		    	bounds.union(place.geometry.viewport);
		    } else {
		    	bounds.extend(place.geometry.location);
		    }
		 */   
		}); //each place
    } //createMarkers

    //make it responsive.
	google.maps.event.addDomListener(window, "resize", function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, "resize");
		map.setCenter(center); 
		//resized open infoWindow- else will be the same size
		infowindow.open(map);
	});
	clearMarkers();
	var bounds = new google.maps.LatLngBounds();
	createMarkers(bounds);
	//map.fitBounds(bounds);	
} //initAutoComplete end

/* KO viewModel
*/
var ViewModel = function (){
	koViewModelInstance = this;
	var self=this;
	self.places=ko.observableArray(places);
	self.markers=ko.observableArray(markers);
	self.filterList=ko.observableArray();
	self.filter=ko.observable("");

	//opensMarker when a list view item is clicked
	self.openMarker=function(place){
		var marker=markers[place.index];
		marker.clicked=true;
		changeColor(marker);	
		openInfoWindow(place,marker,infowindow);
	}

	/*	filterMarkers is called on click(focus) inside the input textArea, to display all the locations.
     *	It is also called when a filter is entered in the text area.
     *	This method calls getFilterList , which creates a List of places matching the filter.
	*/
	self.filterMarkers =function(){
		console.log("Entered filterMarker");
		self.filterList.removeAll();
		self.getFilterList();
	}

    /*	A utility function that returns all places if filter is null
     *	Returns the list of places that matches the filter.
     *	Makes use of the ko.utility.arrayFilter method.
    */
	self.filteredItems = function() {
	    if (!self.filter) {
	    	console.log("filteredItems in filter not true=" +self.filter);
	        return self.places();
	    } else {
	    	console.log("filteredItems in filter true=" +self.places());
	        return ko.utils.arrayFilter(self.places(), function(place) {
	            return place.name.toLowerCase().indexOf(self.filter().toLowerCase()) >=0;
	        });
	    }
	};

	/*	Makes Marker visible for all places in the input param filterdPlaces.
	*/
	self.showMarkers= function (filteredPlaces){
		filteredPlaces.forEach(function (filteredPlace){
			markers[filteredPlace.index].setMap(map);
		});
	};

    /*	Makes all the Markers invisible.
	*/
	self.hideAllMarkers=function (){
		markers.forEach(function (marker){
			marker.setMap(null);
		});
	};
	/*	getFilterList returns all the places in the List if the filter is null and shows all markers
	 *	When filter is not null, hides all markers, calls filteredItems method, shows all marker in the
	 *	filteredList, which is displayed in the LI element below the searchBox.
	*/
	self.getFilterList = function(){
		console.log("filter=" + self.filter());
		var filter = self.filter().toLowerCase();

		if (filter === null) {
	     	self.showMarkers(self.places());
	    	self.filterList(self.places());
	  	} else {
		  self.hideAllMarkers();
		  var filteredPlaces = [];
		  filteredPlaces = self.filteredItems(filter);
		  console.log("FilteredPlaces array=" + JSON.stringify(filteredPlaces));
		  self.showMarkers(filteredPlaces);
		  self.filterList(filteredPlaces);
	  	}
	};
} //ViewModel end

/*	getLocationData, takes an input as marker, does a venue search on foursquare API, displays the
 *	data in the infoWindow on success.
 *	The url that is displayed is clickable , which opens a separate window/tab to the restaurant in focus.
 *	On error, displays "Content could not be loaded"
*/
    
function getLocationData(marker){

	var $infoWindowContent = $('#content');
	var $infoWindowAddress=$('#address');
	var $infoWindowRating=$('#rating');
	var $infoWindowPhone=$('#phone');
	var $infoWindowBodyC=$('#bodyContent');
	var $infoWindowUrl=$('#url');
	var lat= marker.position.lat();
	var long = marker.position.lng();

	/* client_id and client_secret received on registering at foursquare */
	var CLIENT_ID = '1UCDCI3H3VERD2IRAYHFV3YBISAYU3LLF1NDIWM5SFOZTAOO';
	var CLIENT_SECRET = 'L4M0PBEUW4JL4FJH2OGZEC3Q13Q0TDWOFR21MPVSJ3EHUABQ';

	// Using the venue's search api from foursquare.
	var API_ENDPOINT = 'https://api.foursquare.com/v2/venues/search' +
	  '?client_id=' + CLIENT_ID +
	  '&client_secret=' +CLIENT_SECRET +
	  '&v=20130815' +
	  '&ll=' +lat + ',' + long +
	  '&query=' +'\'' +marker.title + '\'&limit=1';
	  
	// Use jQuery to make an AJAX request to Foursquare and update infoWindow values.
	$.getJSON(API_ENDPOINT,function(result) {
		//on success
	    var venue = result.response.venues[0];
	    console.log("venue=" +JSON.stringify(venue));
	    var venuePhone = venue.contact.formattedPhone;
	    var venueAddress = venue.location.formattedAddress;
	    var venueUrl=venue.url;
	    console.log("venue.url=" +venueUrl);
	    //$infoWindowContent.text("");
	    if (venuePhone)
	    	$infoWindowPhone.text('Phone: ' +venuePhone);
	    else
	        $infoWindowPhone.text('Phone number not found');

	  	if (venueAddress) 
	      	$infoWindowAddress.text('Address: ' +venueAddress);
		else
	      	$infoWindowAddress.text('Address not found');

	    if (venueUrl) {
	      	$infoWindowUrl.text(venueUrl);
	      	$infoWindowUrl.attr('href',venueUrl);
	    }  	
		else
	      	$infoWindowUrl.replaceWith('<h5>URL not found</h5>');
	      

	}).error(function(e){
		//on error case
		$infoWindowAddress.replaceWith('<h5>Content could not be loaded</h5>');

	});
    //click on the url in the infoWindow, opens a new page/tab with restaurant info.
	$("#url").click(function() {
	 	var target=$(this).parent().find("a");
	    window.open(target.attr('href'));
	   
	});	
}

ko.applyBindings(new ViewModel());