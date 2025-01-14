(function($) {
    DjangoGooglePointFieldWidget = DjangoMapWidgetBase.extend({

        initializeMap: function(){
            var mapCenter = this.mapCenterLocation;
            if (this.mapCenterLocationName){
                
                this.geocoder.geocode({'address' : this.mapCenterLocationName}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        var geo_location = results[0].geometry.location;
                        mapCenter = [geo_location.lat(), geo_location.lng()];
                    }else{
                        console.warn("Cannot find " + this.mapCenterLocationName + " on google geo service.")
                    }
                    this.map = new google.maps.Map(this.mapElement, {
                        center: new google.maps.LatLng(mapCenter[0], mapCenter[1]),
                        scrollwheel: false,
                        zoomControlOptions: {
                            position: google.maps.ControlPosition.RIGHT
                        },
                        zoom: this.zoom,
                        streetViewControl: this.streetViewControl
                    });

                    $(this.mapElement).data('google_map', this.map);
                    $(this.mapElement).data('google_map_widget', this);

                    if (!$.isEmptyObject(this.locationFieldValue)){
                        this.updateLocationInput(this.locationFieldValue.lat, this.locationFieldValue.lng);
                        this.fitBoundMarker();
                    }

                }.bind(this));

            }else{
                this.map = new google.maps.Map(this.mapElement, {
                    center: new google.maps.LatLng(mapCenter[0], mapCenter[1]),
                    scrollwheel: false,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT
                    },
                    zoom: this.zoom,
                    streetViewControl: this.streetViewControl
                });
                
                $(this.mapElement).data('google_map', this.map);
                $(this.mapElement).data('google_map_widget', this);

                if (!$.isEmptyObject(this.locationFieldValue)){
                    this.updateLocationInput(this.locationFieldValue.lat, this.locationFieldValue.lng);
                    this.fitBoundMarker();
                }
            }

//            console.log("Dropping markers...")
            for (let i = 0; i < this.markers_list.length; i++) {
                const marker = new google.maps.Marker({
                  position: this.markers_list[i].position,
                  title: this.markers_list[i].title,
                  zIndex: -10000,
                  icon: {url: "https://maps.google.com/mapfiles/kml/paddle/purple-circle.png", scaledSize: new google.maps.Size(32, 32)},
                  map: this.map,
                });
            }
        },

        addMarkerToMap: function(lat, lng){
            this.removeMarker();
            var marker_position = {lat: parseFloat(lat), lng: parseFloat(lng)};
            this.marker = new google.maps.Marker({
                position: marker_position,
                map: this.map,
                draggable: true
            });
            this.marker.addListener("dragend", this.dragMarker.bind(this));
        },

        fitBoundMarker: function () {
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(this.marker.getPosition());
            this.map.fitBounds(bounds);
            if (this.markerFitZoom && this.isInt(this.markerFitZoom)){
                var markerFitZoom = parseInt(this.markerFitZoom);
                var listener = google.maps.event.addListener(this.map, "idle", function() {
                    if (this.getZoom() > markerFitZoom) {
                        this.setZoom(markerFitZoom)
                    }
                    google.maps.event.removeListener(listener);
                });
            }
        },

        removeMarker: function(e){
            if (this.marker){
                this.marker.setMap(null);
            }
        },

        dragMarker: function(e){
            this.updateLocationInput(e.latLng.lat(), e.latLng.lng())
        },

        handleAddMarkerBtnClick: function(e){
            $(this.mapElement).toggleClass("click");
            this.addMarkerBtn.toggleClass("active");
            if ($(this.addMarkerBtn).hasClass("active")){
                this.map.addListener("click", this.handleMapClick.bind(this));
            }else{
                google.maps.event.clearListeners(this.map, 'click');
            }
        },

        handleMapClick: function(e){
            google.maps.event.clearListeners(this.map, 'click');
            $(this.mapElement).removeClass("click");
            this.addMarkerBtn.removeClass("active");
            this.updateLocationInput(e.latLng.lat(), e.latLng.lng())
        }
    });

})(mapWidgets.jQuery);
