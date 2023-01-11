<script>
  import { gjScheme, emptyGeojson } from "../stores.js";
  import "carbon-components-svelte/css/white.css";

  const prefix = "dft_connectivity";




  function parseUploadedCSV(csvString, startHours){

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


    //console.log('route_numbers_dict')
    //console.log(route_numbers_dict)

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

    //console.log('req')
    //console.log(req)

    console.log('json processed')  
    
    let req_out = emptyGeojson()
    req_out.features.push(req)
    return req_out
  }

  // Set up local storage sync
  let loadLocal = window.localStorage.getItem(prefix);
  if (loadLocal) {
    try {
      gjScheme.set(JSON.parse(loadLocal));
    } catch (err) {
      console.log(`Failed to load from local storage: ${err}`);
    }
  }
  gjScheme.subscribe((gj) =>
    window.localStorage.setItem(prefix, JSON.stringify(gj))
  );

  function clearAll() {
    if (
      confirm(
        "Do you want to clear the current scheme? (You should save it first!)"
      )
    ) {
      gjScheme.set(emptyGeojson());
    }
  }

  function exportToGeojson() {
    const geojson = $gjScheme;
    var filename = prefix;
    // Include the scheme name if it's set
    if (geojson["scheme_name"]) {
      filename += "_" + geojson["scheme_name"];
    }
    filename += ".geojson";
    downloadGeneratedFile(filename, JSON.stringify(geojson, null, "  "));
  }

  function downloadGeneratedFile(filename, textInput) {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8, " + encodeURIComponent(textInput)
    );
    element.setAttribute("download", filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }


  function loadFile(e) {
    console.log('loading...')
    const reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.addEventListener("load", function (e) {
      let startHours = 8.0;
      let newval = parseUploadedCSV(reader.result, startHours);
      
  
      gjScheme.set(newval);
      console.log('gjScheme updated:')
      console.log(gjScheme)
      console.log(newval)
  })};


</script>

<div>
  <label>
    Scheme name:
    <input type="text" bind:value={$gjScheme.scheme_name} />
  </label>
</div>

<br />

<div>
  <!-- TODO Interactive elements inside a label are apparently invalid, but this works -->
  <label>
    <input type="file" id="load_geojson" on:change={loadFile} />
    <button
      type="button"
      onclick="document.getElementById('load_geojson').click();"
    >
      Load from GeoJSON
    </button>
  </label>

  <button type="button" class="align-right" on:click={exportToGeojson}>
    Export to GeoJSON
  </button>
</div>

<br />

<div>
  <span>{$gjScheme.features.length} interventions</span>
  <button
    type="button"
    class="align-right"
    on:click={clearAll}
    disabled={$gjScheme.features.length == 0}>Clear all</button
  >
</div>

<style>
  .align-right {
    float: right;
  }

  input[type="file"] {
    cursor: pointer;

    /* Make the input type=file effectively invisible, but still let browser accessibility stuff work */
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }
</style>
