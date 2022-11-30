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
            ["get", "overall"],
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
    });

    this.map.on("draw.create", (e) => {
      this.#newRoute(e.features[0]);
    });

    document.getElementById("basemaps").onchange = (e) => {
      this.map.setStyle(
        `https://api.maptiler.com/maps/${e.target.value}/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL`
      );
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
  }
}
