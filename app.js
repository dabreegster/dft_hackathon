import { makeBarChart } from "./area_summary.js";
import { loadBaselineData, setupLSOALayer } from "./baseline_lsoa_scores.js";
import {
  recalculateRouteScores,
  recalculateBuildingScores,
} from "./call_api.js";
import { dropdown } from "./forms.js";
import { geojsonLength } from "./deps/geojson-length.js";

("use strict");

export class App {
  constructor() {
    this.map = new maplibregl.Map({
      container: "map",
      // TODO Actually go get an API key!
      style:
        "https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
      hash: true,
    });
    this.drawControls = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        polygon: true,
      },
      // TODO Disable, because this breaks drawing polygons. We need to do
      // something like https://github.com/acteng/atip/blob/main/style.js
      // maybe.
      /*styles: [
        {
          id: "lines",
          filter: ["==", "$type", "LineString"],
          type: "line",
          paint: {
            "line-color": "black",
            "line-width": 10,
          },
        },
      ],*/
    });

    this.#setupMap();
    this.#setupChartModal();
  }

  #setupMap(setCamera) {
    this.map.on("load", async () => {
      this.map.addControl(this.drawControls);
      this.map.addControl(new maplibregl.ScaleControl());
      this.map.addControl(new maplibregl.NavigationControl(), "bottom-right");

      // These show scores per LSOA
      this.map.addSource("baseline", {
        type: "geojson",
        data: emptyGeojson(),
      });
      this.map.addSource("after", {
        type: "geojson",
        data: emptyGeojson(),
      });

      // Set up the per-LSOA scores baseline layer
      const [baselineGeojson, lsoaGeometry] = await loadBaselineData();
      this.map.getSource("baseline").setData(baselineGeojson);
      // Also remember the geometry per LSOA, for creating the "after" layer later
      this.lsoaGeometry = lsoaGeometry;

      setupLSOALayer(this.map, document.getElementById("show-score").value);
      document.getElementById("show-score").onchange = (e) => {
        // We're changing the dropdown, so remove the old layer first
        this.map.removeLayer("baseline_layer");
        setupLSOALayer(this.map, e.target.value);
      };
      document.getElementById("show-lsoa-scores").onchange = (e) => {
        this.map.setLayoutProperty(
          "baseline_layer",
          "visibility",
          e.target.checked ? "visible" : "none"
        );
      };

      // Set up the bus stops layer
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
          "circle-color": "purple",
        },
      });
    });
    document.getElementById("show-stops").onchange = (e) => {
      this.map.setLayoutProperty(
        "naptan_stops_layer",
        "visibility",
        e.target.checked ? "visible" : "none"
      );
    };

    this.map.on("draw.create", (e) => {
      const feature = e.features[0];
      if (feature.geometry.type == "LineString") {
        this.#newRoute(feature);
      } else {
        this.#newBuilding(feature);
      }
    });

    document.getElementById("basemaps").onchange = (e) => {
      this.map.setStyle(
        `https://api.maptiler.com/maps/${e.target.value}/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL`
      );
    };
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

    // Clicking the map opens the modal
    this.map.on("click", "baseline_layer", (e) => {
      if (this.drawControls.getMode() == "simple_select") {
        var baselineObject = null;
        // Look at everything at the place we clicked
        for (const x of this.map.queryRenderedFeatures(e.point)) {
          if (x.source == "baseline") {
            baselineObject = x;
          } else if (x.source == "mapbox-gl-draw-hot") {
            // We just finished drawing something (or are clicking super near it). Don't open the modal.
            return;
          }
        }
        if (baselineObject) {
          modal.style.display = "block";
          makeBarChart(baselineObject.properties);
        }
      }
    });
  }

  // When the draw tool finishes, this gets called with the line-string created
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

    // Javascript gotcha: getElementById for the button we just created above
    // will ONLY work after the button has been added to the DOM. When we
    // overwrite innerHTML above, that happens.
    document.getElementById("recalculate").onclick = async (e) => {
      e.target.disabled = true;
      e.target.innerText = "Loading...";
      try {
        this.#handleApiResults(await recalculateRouteScores(feature));
      } catch (err) {
        e.target.innerText = `Error: ${err}`;
      }
    };
  }

  #newBuilding(feature) {
    var contents = "";
    contents += `<h2>New building</h2>`;
    contents += dropdown(feature.properties, "purpose", "Building purpose: ", [
      "residential",
      "business",
      "other",
    ]);
    contents += `<div id="building_form"></div>`;
    document.getElementById("form").innerHTML = contents;

    document.getElementById("purpose").onchange = (e) => {
      const purpose = e.target.value;

      if (purpose == "") {
        document.getElementById("building_form").innerHTML = "";
      } else {
        var form = makeBuildingForm(purpose);
        form += `<button type="button" id="recalculate">Recalculate scores</button>`;
        document.getElementById("building_form").innerHTML = form;

        document.getElementById("recalculate").onclick = async (e) => {
          const key = {
            residential: "num_people",
            business: "num_jobs",
            other: "square_footage",
          }[purpose];
          const form_value = document.getElementById(key).value;
          if (form_value == "") {
            alert("Fill out the form first");
            return;
          }

          e.target.disabled = true;
          e.target.innerText = "Loading...";
          try {
            this.#handleApiResults(
              await recalculateBuildingScores(feature, purpose, form_value)
            );
          } catch (err) {
            e.target.innerText = `Error: ${err}`;
          }
        };
      }
    };
  }

  #handleApiResults(data) {
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

    // TODO Figure out how to style this. Improvements should be green, lower
    // scores red, nearly the same shouldn't show up at all. Exactly how this
    // works probably depends on the relative scale of the change, which is why
    // we debug min and max above
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

    // The baseline layer gets in the way.
    // TODO After we've got this "after" source filled out, we need controls to
    // toggle between showing the baseline data and the "after." And to wire up
    // the score picker to "after."
    this.map.setLayoutProperty("baseline_layer", "visibility", "none");
  }
}

function emptyGeojson() {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

// residential, business, other
function makeBuildingForm(purpose) {
  if (purpose == "residential") {
    return `<label for="num_people">Number of people:</label>
      <input type="number" id="num_people" min="1" max="10000">`;
  }
  if (purpose == "business") {
    return `<label for="num_jobs">Number of jobs:</label>
    <input type="number" id="num_jobs" min="1" max="1000">`;
  }
  if (purpose == "other") {
    return `<label for="square_footage">Square footage:</label>
      <input type="number" id="square_footage" min="1" max="100000">`;
  }
  throw new Exception(`unknown value ${purpose}`);
}
