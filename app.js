import { dropdown } from "./forms.js";
import { geojsonLength } from "./deps/geojson-length.js";

("use strict");

export class App {
  #makeChartsCon(sub) {
    var subcar = [
      sub.overall_car,
      sub.Business_car,
      sub.Education_car,
      sub.Shopping_car,
      sub.Visit_friends_at_private_home_car,
      sub.Entertain_public_activity_car,
    ];

    var subwalk = [
      sub.overall_walk,
      sub.Business_walk,
      sub.Education_walk,
      sub.Shopping_walk,
      sub.Visit_friends_at_private_home_walk,
      sub.Entertain_public_activity_walk,
    ];

    var subcycle = [
      sub.overall_cycling,
      sub.Business_cycling,
      sub.Education_cycling,
      sub.Shopping_cycling,
      sub.Visit_friends_at_private_home_cycling,
      sub.Entertain_public_activity_cycling,
    ];

    var subpt = [
      sub.overall_pt,
      sub.Business_pt,
      sub.Education_pt,
      sub.Shopping_pt,
      sub.Visit_friends_at_private_home_pt,
      sub.Entertain_public_activity_pt,
    ];

    // Connectivity Chart
    if (this.conChart) {
      this.conChart.destroy();
    }

    var conctx = document.getElementById("conChart").getContext("2d");

    conChart = new Chart(conctx, {
      type: "bar",
      data: {
        labels: [
          "Overall",
          "Business",
          "Education",
          "Shopping",
          "Friends",
          "Entertainment",
        ],
        datasets: [
          {
            label: "Car",
            data: subcar,
            backgroundColor: "rgba(255, 99, 132, 0.8)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            label: "Walk",
            data: subwalk,
            backgroundColor: "rgba(132, 99, 255, 0.8)",
            borderColor: "rgba(132, 99, 255, 1)",
            borderWidth: 1,
          },
          {
            label: "Bicycle",
            data: subcycle,
            backgroundColor: "rgba(99, 255, 13, 0.8)",
            borderColor: "rgba(99, 255, 13, 1)",
            borderWidth: 1,
          },
          {
            label: "Public Transport",
            data: subpt,
            backgroundColor: "rgba(152,78,163, 0.8)",
            borderColor: "rgba(152,78,163, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        legend: { position: "bottom" },
        scales: {
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Connectivity Score",
              },
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

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
    this.span.onclick = function () {
      modal.style.display = "none";
    };
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
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
          var sub = e.features[0].properties;
          this.#makeChartsCon(sub);
        }
      }
    });
  }

  #SetupLSOALayer(layerId) {
    var lsoacheckBox = document.getElementById("lsoacheck");

    if (lsoacheckBox.checked === true) {
      if (this.map.getLayer("baseline_layer")) {
        this.map.removeLayer("baseline_layer");
      }
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
            10,
            "#67001f",
            20,
            "#b2182b",
            30,
            "#d6604d",
            40,
            "#f4a582",
            50,
            "#fddbc7",
            60,
            "#d1e5f0",
            70,
            "#92c5de",
            80,
            "#4393c3",
            90,
            "#2166ac",
            100,
            "#053061",
          ],
          "fill-outline-color": "rgba(0, 0, 0, 0.2)",
          "fill-opacity": 0.7,
        },
      });
    } else if (this.map.getLayer("baseline_layer")) {
      this.map.removeLayer("baseline_layer");
    }
  }

  #SetupstopsLayer() {
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
    this.map.on("load", () => {
      this.map.addControl(this.drawControls);
      this.map.addControl(new maplibregl.ScaleControl());
      this.map.addControl(new maplibregl.NavigationControl(), "bottom-right");

      this.map.addSource("naptan_stops", {
        type: "geojson",
        data: "/data/naptan_stops.geojson",
      });

      this.map.addSource("baseline", {
        type: "geojson",
        data: "/data/lsoa_scores.geojson",
      });
      this.map.addSource("after", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      this.#SetupLSOALayer(document.getElementById("layer-lsoa").value);
      this.#SetupstopsLayer();
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
      this.#SetupLSOALayer(document.getElementById("layer-lsoa").value);
    };

    document.getElementById("lsoacheck").onchange = (e) => {
      this.#SetupLSOALayer(document.getElementById("layer-lsoa").value);
    };

    document.getElementById("stopscheck").onchange = (e) => {
      this.#SetupstopsLayer();
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
        await this.#recalculate(feature);
      } catch (err) {
        e.target.innerText = `Error: ${err}`;
      }
    };
  }

  async #recalculate(feature) {
    // First we need to snap each of the points to a valid stop
    const endpt = "https://true-swans-flow-34-89-73-233.loca.lt";

    var stops = [];
    for (const pt of feature.geometry.coordinates) {
      const req = {
        lat_long: [pt[1], pt[0]],
        acceptable_distance: 1000,
      };
      console.log(`Lookup stop ${JSON.stringify(req)}`);
      const resp = await fetch(endpt, {
        method: "POST",
        headers: {
          "Bypass-Tunnel-Reminder": "haha",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      });
      const result = await resp.json();
      if (!result.hasOwnProperty("ATCO")) {
        throw `Stop lookup broke: ${JSON.stringify(
          result
        )} for req ${JSON.stringify(req)}`;
      }

      stops.push(result["ATCO"]);
    }
    console.log(`Got stops ${stops}`);

    return this.#callAPI(feature, stops);
  }

  async #callAPI(feature, stops) {
    const realEndpt = "https://thick-humans-tap-34-89-73-233.loca.lt";
    const dummyEndpt = "https://free-rivers-glow-34-89-73-233.loca.lt";

    const startHours = 8;
    const dwellTime = 30;

    const dailyTrips = 10;

    var req = {
      route_number: {},
      trip_id: {},
      ATCO: {},
      stop_sequence: {},
      arrival_times: {},
      departure_times: {},
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
      req["ATCO"][key] = stops[i % stops.length];
      req.stop_sequence[key] = i % stops.length;
      req.arrival_times[key] = lastTime;
      req.departure_times[key] = lastTime + dwellTime;

      lastTime += dwellTime;
      // TODO Time between stops
      lastTime += 1800;
    }

    console.log(`Make real request ${JSON.stringify(req)}`);
    const resp = await fetch(dummyEndpt, {
      method: "POST",
      headers: {
        "Bypass-Tunnel-Reminder": "haha",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });
    const data = await resp.json();

    // TODO Could do this once and stash it somewhere
    const lsoas = await this.#loadLSOAs();

    this.#handleResults(data, lsoas);
  }

  async #loadLSOAs() {
    const resp = await fetch("/data/lsoa_scores.geojson");
    const geojson = await resp.json();
    // Clear (almost) all of the properties
    for (const feature of geojson.features) {
      const id = feature.properties["LSOA11CD"];
      feature.properties = {
        LSOA11CD: id,
      };
    }
    return geojson;
  }

  #handleResults(data, geojson) {
    var props_per_lsoa = {};
    for (const feature of geojson.features) {
      const id = feature.properties["LSOA11CD"];
      props_per_lsoa[id] = {
        LSOA11CD: id,
      };
    }

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
        props_per_lsoa[lsoa][lsoa] = value;
      }
    }

    for (const feature of geojson.features) {
      const id = feature.properties["LSOA11CD"];
      feature.properties = props_per_lsoa[id];
    }

    this.map.addSource("after", {
      type: "geojson",
      data: geojson,
    });

    this.map.addLayer({
      id: "after_layer",
      source: "after",
      type: "fill",
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          // TODO Fixed
          ["get", "overall"],
          10,
          "#67001f",
          20,
          "#b2182b",
          30,
          "#d6604d",
          40,
          "#f4a582",
          50,
          "#fddbc7",
          60,
          "#d1e5f0",
          70,
          "#92c5de",
          80,
          "#4393c3",
          90,
          "#2166ac",
          100,
          "#053061",
        ],
        "fill-outline-color": "rgba(0, 0, 0, 0.2)",
        "fill-opacity": 0.7,
      },
    });
  }
}
