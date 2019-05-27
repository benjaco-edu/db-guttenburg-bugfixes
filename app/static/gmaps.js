var map;

function myMap(){
    var mapProp= {
        center:new google.maps.LatLng(40,-50),
        zoom:3,
      };
    map = new google.maps.Map(document.getElementById("map"), mapProp);


}