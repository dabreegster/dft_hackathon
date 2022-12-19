import { makeChartsCon } from "./area_summary.js";
import { loadBaselineData, setupLSOALayer } from "./baseline_lsoa_scores.js";
import { recalculateScores } from "./call_api.js";
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
    this.#setupChartModal();
  }

  #setupChartModal() {
    const modal = document.getElementById("modal");
    // When the user clicks on <span> (x), close the modal
    document.getElementsByClassName("close")[0].onclick = () => {
      modal.style.display = "none";
    };
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (ev) => {
      if (ev.target == modal) {
        modal.style.display = "none";
      }
    };

    // How map triggers the modal
    // On click open modal
    this.map.on("click", "baseline_layer", (e) => {
      if (this.drawControls.getMode() == "simple_select") {
        // Block Modal when clicking on other layers
        let f = this.map.queryRenderedFeatures(e.point);
        f = f.filter(function (el) {
          return el.source == "baseline";
        });

        if (f.length == 1) {
          modal.style.display = "block";
          makeChartsCon(e.features[0].properties);
        }
      }
    });
  }

  #setupStopsLayer() {
    var stopscheckBox = document.getElementById("stopscheck");

    if (stopscheckBox.checked === true) {
      this.map.addLayer({
        id: "naptan_stops_layer",
        type: "circle",
        source: "naptan_stops",
        paint: {
          "circle-radius": 5,
          "circle-color": "purple",
        },
      });
    } else {
      if (this.map.getLayer("naptan_stops_layer"))
        this.map.removeLayer("naptan_stops_layer");
    }
  }

  #setupMap(setCamera) {
    this.map.on("load", async () => {
      this.map.addControl(this.drawControls);
      this.map.addControl(new maplibregl.ScaleControl());
      this.map.addControl(new maplibregl.NavigationControl(), "bottom-right");

      this.map.addSource("naptan_stops", {
        type: "geojson",
        data: "/data/naptan_stops.geojson",
      });

      this.map.addSource("baseline", {
        type: "geojson",
        data: emptyGeojson(),
      });
      this.map.addSource("after", {
        type: "geojson",
        data: emptyGeojson(),
      });

      const [baselineGeojson, lsoaGeometry] = await loadBaselineData();
      this.map.getSource("baseline").setData(baselineGeojson);
      this.lsoaGeometry = lsoaGeometry;

      setupLSOALayer(this.map, document.getElementById("layer-lsoa").value);
      this.#setupStopsLayer();
    });

    this.map.on("draw.create", (e) => {
      this.#newRoute(e.features[0]);
    });

    document.getElementById("basemaps").onchange = (e) => {
      this.map.setStyle(
        `https://api.maptiler.com/maps/${e.target.value}/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL`
      );
    };

    document.getElementById("layer-lsoa").onchange = (e) => {
      setupLSOALayer(this.map, document.getElementById("layer-lsoa").value);
    };
    document.getElementById("lsoacheck").onchange = (e) => {
      setupLSOALayer(this.map, document.getElementById("layer-lsoa").value);
    };

    document.getElementById("stopscheck").onchange = (e) => {
      this.#setupStopsLayer();
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

    document.getElementById("recalculate").onclick = async (e) => {
      e.target.disabled = true;
      e.target.innerText = "Loading...";
      try {
        this.#handleResults(await recalculateScores(feature));
      } catch (err) {
        e.target.innerText = `Error: ${err}`;
      }
    };
  }

  #handleResults(data) {
    var props_per_lsoa = {};
    for (const [id, _] of Object.entries(this.lsoaGeometry)) {
      props_per_lsoa[id] = {
        LSOA11CD: id,
      };
    }

    var min = Number.MAX_VALUE;
    var max = Number.MIN_VALUE;

    // Go through and fill out properties in the LSOA polygons
    for (const purpose of [
      "Business",
      "Education",
      "Entertain / public activity",
      "Shopping",
      "Visit friends at private home",
      "overall",
    ]) {
      for (const [key, value] of Object.entries(data[`${purpose}_diff`])) {
        const lsoa = data.lsoa[key];
        props_per_lsoa[lsoa][purpose] = value;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }

    console.log(JSON.stringify(props_per_lsoa));
    console.log(`Diff ranges from ${min} to ${max}`);

    // Combine props_per_lsoa with lsoaGeometry to make GeoJSON again
    var geojson = emptyGeojson();
    for (const [id, props] of Object.entries(data[`${purpose}_diff`])) {
      geojson.features.push({
        type: "Feature",
        properties: props,
        geometry: this.lsoaGeometry[id],
      });
    }
    this.map.getSource("after").setData(geojson);

    this.map.addLayer({
      id: "after_layer",
      source: "after",
      type: "fill",
      paint: {
        "fill-color": "green",
        "fill-opacity": ["get", "overall"],
        "fill-outline-color": "black",
        "fill-opacity": 0.5,
      },
    });

    // Gets in the way
    this.map.removeLayer("baseline_layer");
  }
}

function emptyGeojson() {
  return {
    type: "FeatureCollection",
    features: [],
  };
}
