var map;

function myMap(lat, lng){
    var mapProp= {
        center:new google.maps.LatLng(55, 12),
        zoom:3,
        styles: [
          {
            "featureType": "administrative.locality",
            "elementType": "labels.icon",
            "stylers": [
              {
                "color": "#a2a2a2"
              },
              {
                "weight": 1
              }
            ]
          }
        ]
      };
    map = new google.maps.Map(document.getElementById("map"), mapProp);
 
}

let objects = []
function addPin(loc, addToCollection = true){
  if(typeof loc === "string"){
    let parse = loc.match(/POINT\((-?\d*\.\d*) (-?\d*\.\d*)\)/);
    if(parse[1] === undefined){
      console.error(loc, " is not a mysql point")
    }
    loc = {lat: parseFloat(parse[1]),lng:parseFloat(parse[2])}
  }else{
    loc = {lat: loc[1],lng:loc[0]}
  }
  let marker = new google.maps.Marker({
      position: loc,
      map: map
  });
  if(addToCollection)
    objects.push(marker)

  return marker;
}

function addCircle(loc, radius = 10){
  if(typeof loc === "string"){
    let parse = loc.match(/POINT\((-?\d*\.\d*) (-?\d*\.\d*)\)/);
    loc = {lat: parseFloat(parse[1]),lng:parseFloat(parse[2])}
  }else{
    loc = {lat: loc[1],lng:loc[0]}
  }
  
  var marker = new google.maps.Circle({
    strokeColor: '#000',
    strokeOpacity: 0.5,
    strokeWeight: 2,
    fillColor: '#000',
    fillOpacity: 0.35,
    map: map,
    center: loc,
    radius: radius*1000
  });


  objects.push(marker)

  return marker;
}

function clearMap(){
  for(let i of objects){
    i.setMap(null)
  }
  objects = []
}