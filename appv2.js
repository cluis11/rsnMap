var width = $(window).width();
CustomMarker.prototype = new google.maps.OverlayView();

function CustomMarker(opts) {
    this.setValues(opts);
}


CustomMarker.prototype.draw = function() {
    var self = this;
    var div = this.div;
    if (!div) {
        div = this.div = $('' +
            '<div>' +
   //         '<div class="shadow"></div>' +
            '<div class="pulse"></div>' +
   //         '<div class="pin-wrap">' +
   //         '<div class="pin"></div>' +
            '</div>' +
            '</div>' +
            '')[0];
   //     this.pinWrap = this.div.getElementsByClassName('pin-wrap');
   //     this.pin = this.div.getElementsByClassName('pin');
        this.pinShadow = this.div.getElementsByClassName('shadow');
        div.style.position = 'absolute';
        div.style.cursor = 'pointer';
        var panes = this.getPanes();
        panes.overlayImage.appendChild(div);
        google.maps.event.addDomListener(div, "click", function(event) {
            google.maps.event.trigger(self, "click", event);
        });
    }
    var point = this.getProjection().fromLatLngToDivPixel(this.position);
    if (point) {
        div.style.left = point.x + 'px';
        div.style.top = point.y + 'px';
    }
};

CustomMarker.prototype.remove = function() {
    if (this.div) {
      this.div.parentNode.removeChild(this.div);
      this.div = null;
    }
  };




// Main function
google.maps.event.addDomListener(window, 'load', function() {
    var markers = [];
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: new google.maps.LatLng(9.4, -84),
        optimized: false,
        zoomControlOptions: {
              position: google.maps.ControlPosition.LEFT_TOP
          },
        styles: [{
            'featureType': 'administrative.country',
            'elementType': 'geometry.stroke',
            'stylers': [{
                'color': '#263238'
            }, {
                'weight': 1
            }]
        }, {
            'featureType': 'administrative.land_parcel',
            'elementType': 'geometry.fill',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'administrative.land_parcel',
            'elementType': 'labels',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'administrative.province',
            'elementType': 'geometry.stroke',
            'stylers': [{
                'color': '#546e7a'
            }, {
                'weight': 0.5
            }]
        }, {
            'featureType': 'landscape.natural.terrain',
            'elementType': 'geometry.fill',
            'stylers': [{
                'color': '#b3d09c'
            }]
        }, {
            'featureType': 'poi',
            'elementType': 'labels.text',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'road.arterial',
            'elementType': 'labels',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'road.highway',
            'elementType': 'geometry.fill',
            'stylers': [{
                'color': '#ffffff'
            }, {
                'weight': 1
            }]
        }, {
            'featureType': 'road.highway',
            'elementType': 'geometry.stroke',
            'stylers': [{
                'color': '#ffffff'
            }, {
                'visibility': 'off'
            }, {
                'weight': 0.5
            }]
        }, {
            'featureType': 'road.highway',
            'elementType': 'labels',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'road.highway.controlled_access',
            'elementType': 'geometry.stroke',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'road.local',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'road.local',
            'elementType': 'labels',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'transit',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'water',
            'elementType': 'geometry.fill',
            'stylers': [{
                'color': '#9fd1ff'
            }]
        }]
    });

    $('.button-collapse').sideNav({
        menuWidth: 280
    });

    var usingFilters = false;



    $('.filter').click(function(eventObject) {
        var $this = $(this);

        if ($this.hasClass('active')) return;

        $('.active').removeClass('active');

        if (usingFilters) {
            var values = {};
            $.each($('#filter_form').serializeArray(), function(i, field) {
                values[field.name] = field.value;
            });
            if ($this.hasClass('week-filter')) {
                currentFilter = 1;
                userFilters(values);
            } else {
                currentFilter = 2;
                userFilters(values);
            }
        } else {
            if ($this.hasClass('week-filter')) {
                addMarkers(allSeisms);
                currentFilter = 1;
            } else {
                currentFilter = 2;
                var twentyFourHoursAgo = moment()
                    .utcOffset('-06:00')
                    .add(-24, 'hours')
                    .unix();
                addMarkers(allSeisms.filter(function(seism, index, arr) {
                    return moment(seism['origin_time'].replace('Z', '+06:00'))
                        .unix() >= twentyFourHoursAgo;
                }));
            }
        }

        $this.addClass('active');
    });

    var allSeisms = [],
        url = 'http://rsnapiusr.ucr.ac.cr/api/seisms/' +
        'getWebMapSeisms' +
        '?access_token=559aca63553be4973f58dbc1',
        addMarkers = function(seisms) {
            clearOverlays();
            var normalIcon = '../mapa/icons/pin_verde.svg',
                midIcon = '../mapa/icons/pin_naranja.svg',
                dangerIcon = '../mapa/icons/pin_rojo.svg',
                infowindow = new google.maps.InfoWindow();
            seisms.forEach(function(seism, index, arr) {
                var time = moment.tz(seism['origin_time'].toString().replace('Z', '+06:00'), "America/Costa_Rica").format('DD-MM-YYYY h:mm a')
                seism.localDateTime = time;
                if(index === 0) {
                $('[data-latest-seism="localDateTime"]')
                    .text(seism.localDateTime);
                $('[data-latest-seism="magnitude"]')
                    .text(seism.magnitude + ' Mw');
                $('[data-latest-seism="depth"]')
                    .text(seism.depth + ' km');
                $('[data-latest-seism="lat"]')
                    .text(Math.abs(seism.lat) + (seism.lat < 0?' S': ' N'));
                $('[data-latest-seism="lon"]')
                    .text(Math.abs(seism.lon) + (seism.lat < 0?' E': ' O'));
                $('[data-latest-seism="local"]')
                    .text(seism.local);
            }
                var icon = normalIcon;
                if (seism.magnitude > 3.5) {
                    icon = midIcon;
                }
                if (seism.magnitude >= 5) {
                    icon = dangerIcon;
                }
                var SVGMarker = {
                    url: icon,
                    anchor: new google.maps.Point(8.5, 51),
                    size: new google.maps.Size(17, 51)
                };
                var marker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(seism.lat, seism.lon),
                    title: seism.local,
                    icon: SVGMarker
                });

                if (index===0){
                      var markerPulse = new CustomMarker({
                      position: new google.maps.LatLng(seism.lat, seism.lon),
                      map: map,
                  });   
              }
                var content = [
                    '<b class="fecha_hora_infoWindow">Fecha y Hora Local: </b> <span class="fecha_hora_infoWindow">' + seism.localDateTime + '</span>',
                    '<b class="fecha_hora_infoWindow">Magnitud: </b> <span class="fecha_hora_infoWindow">' + seism.magnitude + ' Mw' + '</span>',
                    '<b class="fecha_hora_infoWindow">Ubicaci&oacute;n: </b> <span class="fecha_hora_infoWindow">' + seism.local + '</span>',
                    '<b class="fecha_hora_infoWindow">Profundidad :</b> <span class="fecha_hora_infoWindow">' + seism.depth + ' km' + '</span>',
                    '<b class="fecha_hora_infoWindow">Latitud: </b> <span class="fecha_hora_infoWindow">' +
                    (
                        Math.abs(seism.lat) +
                        (seism.lat < 0 ? ' S' : ' N')
                    ) + '</span>',
                    '<b class="fecha_hora_infoWindow">Longitud: </b> <span class="fecha_hora_infoWindow">' +
                    (
                        Math.abs(seism.lon) +
                        (seism.lat < 0 ? ' E' : ' O')
                    ) + '</span>',
                    '<b class="fecha_hora_infoWindow">Localizaci&oacute;n: </b> <span class="fecha_hora_infoWindow">Revisada por ' +
                    seism.agency + '</span>'
                ].join('<br />');
                google.maps.event.addListener(marker, 'click', (function(marker) {
                    return function() {
                        infowindow.setContent(content);
                        infowindow.setOptions({
                            maxWidth: 200
                        });
                        infowindow.open(map, marker);
                    }
                })(marker));
                markers.push(marker);
            });
        };

    function clearOverlays() {
    	for (var i = 0; i < markers.length; i++ ) {
    		markers[i].setMap(null);
    	}
    	markers.length = 0;
        CustomMarker.prototype.setMap(null);
    }

    function getSeisms() {
        $.get(url).then(function(result) {
            allSeisms = result.seisms;
            addMarkers(allSeisms);
        }, function(error) {
            console.error(error);
        });
    }
    getSeisms();
});