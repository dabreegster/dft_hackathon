/// To deal with file upload
function uploadProcess(handleApiResults) {
  /// TODO: change this so it isnt hard coded!
  const startHours = 8;

  var fileInput = document.getElementById("fileInput");

  // Listen for changes to the file input element
  fileInput.addEventListener("change", function () {
    // Get the file
    var file = fileInput.files[0];

    // Create a new FileReader and load file to it as text
    var reader = new FileReader();
    reader.readAsText(fileInput.files[0]);

    // Listen for the 'load' event, which is triggered when the file has been read
    reader.addEventListener("load", function (e) {
      // Get the file content as a string
      var csvString = reader.result;

      // Split the CSV string into an array of rows
      var rows = csvString.split("\n");

      // Loop through the rows and parse the CSV data, ignoring first row which is headers
      var data = [];
      for (var i = 1; i < rows.length; i++) {
        data.push(rows[i].split(","));
      }

      // making arrays for these
      const route_numbers = data.map((innerArray) => innerArray[0]);
      const trip_ids = data.map((innerArray) => innerArray[1]);
      const ATCOs = data.map((innerArray) => innerArray[2]);
      const stop_sequences = data.map((innerArray) => innerArray[3]);
      const arrival_times = data.map((innerArray) => innerArray[4]);
      const departure_times = data.map((innerArray) => innerArray[5]);

      // converting arrays to dictionaries for inputs
      let route_numbers_dict = {};
      let trip_ids_dict = {};
      let ATCOs_dict = {};
      let stop_sequences_dict = {};
      let arrival_times_dict = {};
      let departure_times_dict = {};
      for (var i = 0; i < route_numbers.length; i++) {
        route_numbers_dict[i] = route_numbers[i];
        trip_ids_dict[i] = trip_ids[i];
        ATCOs_dict[i] = ATCOs[i];
        stop_sequences_dict[i] = stop_sequences[i];
        arrival_times_dict[i] = arrival_times[i];
        departure_times_dict[i] = departure_times[i];
      }

      // initialise request payload
      var req = {
        route_number: route_numbers_dict,
        trip_id: trip_ids_dict,
        ATCO: ATCOs_dict,
        stop_sequence: stop_sequences_dict,
        arrival_times: arrival_times_dict,
        departure_times: departure_times_dict,
        TripStartHours: startHours,
        max_travel_time: 3600,
        return_home: false,
        geography_level: "lsoa",
        new_buildings: "",
      };

      ///// Call api and act on results
      try {
        handleApiResults(callAPI(req));
      } catch (err) {
        e.target.innerText = `Error: ${err}`;
      }
    });
  });
}

async function findStopsPreApiCall(features_all) {
  // Loops through all features which are 'type' === 'service' and finds ATCO codes
  // of existing stops
  // This goes to Snap_API.py which finds nearest public transport stop as the crow flies

  const endpt = "https://cuddly-islands-stick-34-89-73-233.loca.lt";

  for (var i = 0; i < features_all.length; i++) {
    let feature = features_all[i];

    /// No need to find closest PT stops for new build features
    if (feature["type"] === "newbuild") {
      continue;
    }

    var stops = [];
    for (const pt of feature.geometry.coordinates) {
      const req = {
        // https://macwright.com/lonlat/
        lat_long: [pt[1], pt[0]],
        acceptable_distance: 1000,
      };
      console.log(`Lookup stop ${JSON.stringify(req)}`);
      const resp = await fetch(endpt, {
        method: "POST",
        headers: {
          // I don't remember why this was necessary
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

    feature["stop_ATCOs"] = stops;
    features_all[i] = feature;
  }

  return initialisePayloadFromUi(features_all);
}

async function initialisePayloadFromUi(features_all) {
  // startHours = time in hours the first service starts
  // dwellTime = seconds waiting at stop
  // dailyTrips = total number of times service runs in a day
  // timeBetweenStops = seconds between each service

  const startHours = 8;
  const dwellTime = 0;
  const dailyTrips = 10;
  const timeBetweenStops = 1800;

  // convert new build features to input for api payload
  var new_builds_array = [];

  // initialising request payload
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

  var i_so_far = 0;
  for (var i = 0; i < features_all.length; i++) {
    let feature = features_all[i];

    /// extract data for request payload
    if (feature["type"] === "newbuild") {
      new_builds_array.push([
        feature.purpose,
        feature.centroid_latlong,
        feature.form_value,
      ]);
    } else {
      /// new service
      var stops = feature["stop_ATCOs"];
      var lastTime = 3600 * startHours;
      var iterations = dailyTrips * stops.length;

      // TODO: factor in speed and frequency to make the route
      var speed = feature.speed;
      var frequency = feature.frequency;

      for (var i = 0; i < iterations; i++) {
        const key = `${i_so_far + i}`;

        req.route_number[key] = 0;
        req.trip_id[key] = Math.floor(i / stops.length);
        req["ATCO"][key] = stops[i % stops.length];
        req.stop_sequence[key] = i % stops.length;
        req.arrival_times[key] = lastTime;
        req.departure_times[key] = lastTime + dwellTime;

        lastTime += dwellTime;
        lastTime += timeBetweenStops;
      }

      i_so_far = i_so_far + iterations;
    }
  }

  // add data on new build sites
  req["new_buildings"] = new_builds_array;

  return callAPI(req);
}

async function callAPI(req) {
  const realEndpt = "https://thick-humans-tap-34-89-73-233.loca.lt";
  const dummyEndpt = "https://moody-weeks-peel-34-89-73-233.loca.lt";

  console.log(`Make request ${JSON.stringify(req)}`);
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
  return data;
}

function handleApiResults(data, geojson) {
  var props_per_lsoa = {};
  for (const feature of geojson.features) {
    const id = feature.properties["LSOA11CD"];
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

  for (const feature of geojson.features) {
    const id = feature.properties["LSOA11CD"];
    feature.properties = props_per_lsoa[id];
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

  /// TODO: add process to show stats on overall connectivity effects of the new intervention, esp
  /// 'pop_weighted_score'

  /*
    ## What return from api will look like

    {'pop_weighted_score': 1.0482932671911964,
     'results_table': {'Business_diff': {'0': 0.40295215722307853,
       '1': 0.0,
       '2': 0.0},
      'Education_diff': {'0': 0.0, '1': 0.0, '2': 0.0},
      'Entertain / public activity_diff': {'0': 0.0,
       '1': 1.5637245306633338,
       '2': 0.0},
      'Shopping_diff': {'0': 0.570380612904049,
       '1': 0.0,
       '2': 0.048947593586917915},
      'Visit friends at private home_diff': {'0': 0.0,
       '1': 0.08132333301040305,
       '2': 0.0},
      'lsoa': {'0': 'E01024471', '1': 'E01024747', '2': 'E01000680'},
      'overall_diff': {'0': 0.9733327701271275,
       '1': 1.645047863673737,
       '2': 0.048947593586917915}
       }
    }
    */
}

// Returns the baseline GeoJSON data and also a dictionary from LSOA ID to geometry
async function loadBaselineData() {
  const resp = await fetch("/data/lsoa_scores.geojson");
  const geojson = await resp.json();

  // Make a copy of the geometry, keyed by ID
  var lsoaGeometry = {};

  // Clear (almost) all of the properties
  for (const feature of geojson.features) {
    const id = feature.properties["LSOA11CD"];
    // TODO I don't think we need to clone here, but it kind of depends what setData() does?
    lsoaGeometry[id] = feature.geometry;
  }

  return [geojson, lsoaGeometry];
}
