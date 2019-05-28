var map;

function myMap(lat, lng){
    var mapProp= {
        center:new google.maps.LatLng(55, 12),
        zoom:3,
      };
    map = new google.maps.Map(document.getElementById("map"), mapProp);

    map.addListener('click', function(event) {
      let radius = document.getElementById('rangeSlider').value;
      placeMarker(event.latLng, map, radius );
    });
  
 
}

function placeMarker(position, map, radius) {
  var marker = new google.maps.Marker({
      position: position,
      map: map
  });

  var cityCircle = new google.maps.Circle({
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    map: map,
    center: position,
    radius: radius*1000
  });




  map.panTo(position);

  
}
