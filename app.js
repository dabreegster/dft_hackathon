import { dropdown } from "./forms.js";
import { geojsonLength } from "./deps/geojson-length.js";

("use strict");

export class App {
  constructor() {
    this.map = new maplibregl.Map({
      container: "map",
      style:
        "https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
      hash: true,
    });
    this.drawControls = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
      },
      styles: [
        {
          id: "lines",
          filter: ["==", "$type", "LineString"],
          type: "line",
          paint: {
            "line-color": "black",
            "line-width": 10,
          },
        },
      ],
    });

    this.#setupMap();
    
    // Modal Popup
    this.modal = document.getElementById("modal");
    this.span = document.getElementsByClassName("close")[0];
    // When the user clicks on <span> (x), close the modal
    this.span.onclick = function() {
      modal.style.display = "none";
    };
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
    	modal.style.display = "none";
      }
    };
    
    
    // How map triggers the modal 
    // On click open modal
    this.map.on('click', 'baseline_layer', function(e) {
      
      // Block Modal when clicking on other layers
      //let f = this.map.queryRenderedFeatures(e.point);
      //f = f.filter(function (el) {
      //  return el.source != 'composite';
      //});
      
      //if (f.length == 1) {
        modal.style.display = "block";
        var sub = e.features[0].properties;
        
        
        
      //} 
    	
    });
    
  }
  
  #SetupLSOALayer(layerId) {
    if (this.map.getLayer('baseline_layer')) this.map.removeLayer('baseline_layer');
    this.map.addLayer({
      id: "baseline_layer",
      source: "baseline",
      type: "fill",
      // From https://github.com/creds2/CarbonCalculator/blob/master/www/js/layer_control.js
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          //["-", 100.0, ["get", "overall"]],
          ["get", layerId],
          20,
          "#800026",
          30,
          "#bd0026",
          40,
          "#e31a1c",
          50,
          "#fc4e2a",
          60,
          "#fd8d3c",
          70,
          "#feb24c",
          80,
          "#fed976",
          90,
          "#ffeda0",
          100,
          "#ffffcc",
        ],
        "fill-outline-color": "rgba(0, 0, 0, 0.2)",
        "fill-opacity": 0.7,
      },
    });
  }

  #setupMap(setCamera) {
    this.map.on("load", () => {
      this.map.addControl(this.drawControls);
      this.map.addControl(new maplibregl.ScaleControl());
      this.map.addControl(new maplibregl.NavigationControl(), "bottom-right");

      this.map.addSource("naptan_stops", {
        type: "geojson",
        data: "/data/naptan_stops.geojson",
      });
      this.map.addLayer({
        id: "naptan_stops_layer",
        type: "circle",
        source: "naptan_stops",
        paint: {
          "circle-radius": 5,
          "circle-color": "blue",
        },
      });

      this.map.addSource("baseline", {
        type: "geojson",
        data: "/data/lsoa_scores.geojson",
      });
      
      this.#SetupLSOALayer(document.getElementById("layer-lsoa").value);
    });

    this.map.on("draw.create", (e) => {
      this.#newRoute(e.features[0]);
    });
    
    document.getElementById("basemaps").onchange = (e) => {
      this.map.setStyle(
        `https://api.maptiler.com/maps/${e.target.value}/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL`
      );
    }
    
    document.getElementById("layer-lsoa").onchange = (e) => {
      this.#SetupLSOALayer(document.getElementById("layer-lsoa").value);
    };
    
  }

  #newRoute(feature) {
    const length = Math.round(geojsonLength(feature.geometry));

    var contents = "";
    contents += `<h2>Length of route: ${length} meters</h2>`;
    contents += dropdown(
      feature.properties,
      "speed",
      "Speed of the train (km/h): ",
      [100, 150, 200]
    );
    contents += dropdown(
      feature.properties,
      "frequency",
      "Peak frequency the train (km/h): ",
      [100, 150, 200]
    );
    contents += `<button type="button" id="recalculate">Recalculate scores</button>`;
    document.getElementById("form").innerHTML = contents;

    document.getElementById("recalculate").onclick = async () => {
      this.#callAPI(feature);
    };
  }

  async #callAPI(feature) {
    const realEndpt = "https://thick-humans-tap-34-89-73-233.loca.lt";
    const dummyEndpt = "https://free-rivers-glow-34-89-73-233.loca.lt";

    const startHours = 8;
    const dwellTime = 30;

    // TODO Snap linestring to nearest ATC codes
    const stops = ["0100AVONMTH0", "0100BHB0", "0100BRP90318"];

    const dailyTrips = 10;

    var req = {
      route_number: {},
      trip_id: {},
      ATC0: {},
      stop_sequence: {},
      arrival_time: {},
      departure_time: {},
      TripStartHours: startHours,
      max_travel_time: 3600,
      return_home: false,
      geography_level: "lsoa",
    };

    var lastTime = 3600 * startHours;
    for (var i = 0; i < dailyTrips * stops.length; i++) {
      const key = `${i}`;

      req.route_number[key] = 0;
      req.trip_id[key] = Math.floor(i / stops.length);
      req["ATC0"][key] = stops[i % stops.length];
      req.stop_sequence[key] = i % stops.length;
      req.arrival_time[key] = lastTime;
      req.departure_time[key] = lastTime + dwellTime;

      lastTime += dwellTime;
      // TODO Time between stops
      lastTime += 1800;
    }

    const resp = await fetch(dummyEndpt, {
      method: "POST",
      body: JSON.stringify(req),
    });
    const text = await resp.text();
    console.log(text);
  }
  
  
  
}

