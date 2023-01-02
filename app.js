    // Tooltip: to reflect new LSOA hovered over
    var hoveredStateId = null;
    this.map.on("mousemove", "baseline_layer", function (e) {
      if (e.features.length > 0) {
        // get LSOA which is now hovered over. 'properties' includes all connectivity scores for that LSOA
        hoveredStateId = e.features[0].properties.LSOA11CD;

        // change text for the LSOA which is now hovered over
        document.getElementById("hoverinfo-textbox").innerHTML = (
          hoveredStateId + "<br>"
        ).concat(
          "\n",
          JSON.stringify(e.features[0].properties).replaceAll(",", "<br>")
        );
      }
    });
    // dropping record of previous LSOA hovered over
    this.map.on("mouseleave", "baseline_layer", function () {
      // remove text for that LSOA
      if (hoveredStateId !== null) {
        document.getElementById("hoverinfo-textbox").textContent = "";
      }
      hoveredStateId = null;
    });


  #newBuilding(feature) {
    /// TODO: extract centroid. Hard coding it for now
    console.log(feature.geometry.coordinates);
    var centroid_latlong = [0.1276, 51.5072];
    feature["centroid_latlong"] = centroid_latlong;

    var contents = "";
    contents += `<h2>New building</h2>`;
    contents += dropdown(feature.properties, "purpose", "Building purpose: ", [
      "residential",
      "business",
      "shopping",
      "leisure",
      "education",
    ]);
    contents += `<div id="building_form"></div>`;
    document.getElementById("form").innerHTML = contents;

    document.getElementById("purpose").onchange = (e) => {
      const purpose = e.target.value;

      if (purpose == "") {
        document.getElementById("building_form").innerHTML = "";
      } else {
        var form = makeBuildingForm(purpose);
        form += `<br>`;
        form += `<button type="button" id="recalculate">Recalculate scores</button>`;
        form += `<br>`;
        form += `<button type="button" id="addanother">Add another route</button>`;
        document.getElementById("building_form").innerHTML = form;

        document.getElementById("recalculate").onclick = async (e) => {
          features_all = store_feature(feature, features_all);
          e.target.disabled = true;
          e.target.innerText = "Loading...";
          try {
            this.#handleApiResults(await findStopsPreApiCall(features_all));
          } catch (err) {
            e.target.innerText = `Error: ${err}`;
          }
        };

        document.getElementById("addanother").onclick = async (e) => {
          features_all = store_feature(feature, features_all);
          collapse_sidebar();
        };
      }
    };
  }

  #handleApiResults(data, geojson) {
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

// residential, business, other
function makeBuildingForm(purpose) {
  if (purpose == "residential") {
    return `<label for="num_people">Number of people:</label>
      <input type="number" id="num_people" min="1" max="100000">`;
  }
  if (purpose == "business") {
    return `<label for="num_jobs">Number of jobs:</label>
    <input type="number" id="num_jobs" min="1" max="10000">`;
  }
  if (purpose == "shopping") {
    return `<label for="square_footage">Square footage:</label>
      <input type="number" id="square_footage" min="1" max="100000">`;
  }
  if (purpose == "leisure") {
    return `<label for="square_footage">Square footage:</label>
      <input type="number" id="square_footage" min="1" max="100000">`;
  }
  if (purpose == "education") {
    return `<label for="square_footage">Square footage:</label>
      <input type="number" id="square_footage" min="1" max="100000">`;
  }
  throw new Exception(`unknown value ${purpose}`);
}
