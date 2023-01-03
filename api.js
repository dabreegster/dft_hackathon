const stopLookupEndpt = "https://cuddly-islands-stick-34-89-73-233.loca.lt";
const stopSnapDistance = 1000;
const realConnectivityEndpt = "https://thick-humans-tap-34-89-73-233.loca.lt";
const dummyConnectivityEndpt = "https://moody-weeks-peel-34-89-73-233.loca.lt";

// Takes the GeoJSON features and creates the API request. Has the side effect
// of calling the stop lookup API.
export async function geojsonToApiPayload(features) {
  // time in hours the first service starts
  const startHours = 8;
  // seconds waiting at stop
  const dwellTime = 0;
  // total number of times service runs in a day
  const dailyTrips = 10;
  // seconds between each service
  const timeBetweenStops = 1800;

  // Fill out this request payload
  let req = {
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
    new_buildings: [],
  };

  for (let feature of features) {
    if (feature.geometry.type == "Polygon") {
      let value = feature.areaSquareMeters;
      if (feature.properties.purpose == "residential") {
        value = feature.properties.num_people;
      } else if (feature.properties.purpose == "business") {
        value = feature.properties.num_jobs;
      }

      req.new_buildings.push([
        feature.properties.purpose,
        feature.properties.centroid,
        value,
      ]);
    } else {
      // Make the payload for a new PT service
      let stops = feature.properties["stop_ATCOs"];

      // TODO: factor in speed and frequency to make the route
      let speed = feature.properties.speed;
      let frequency = feature.properties.frequency;

      var lastTime = 3600 * startHours;
      for (let i = 0; i < dailyTrips * stops.length; i++) {
        // Use an increasing key based on all routes
        const key = Object.keys(req.route_number).length;

        req.route_number[key] = 0;
        req.trip_id[key] = Math.floor(i / stops.length);
        req["ATCO"][key] = stops[i % stops.length];
        req.stop_sequence[key] = i % stops.length;
        req.arrival_times[key] = lastTime;
        req.departure_times[key] = lastTime + dwellTime;

        lastTime += dwellTime + timeBetweenStops;
      }
    }
  }

  return req;
}

// Takes a payload from geojsonToApiPayload and returns the response
export async function callApi(req) {
  const resp = await fetch(dummyConnectivityEndpt, {
    method: "POST",
    headers: jsonRequestHeaders(),
    body: JSON.stringify(req),
  });
  const data = await resp.json();
  return data;
}

// Modify features representing new PT routes by looking up ATC0 codes of
// existing stops
async function lookupStops(features) {
  // This goes to Snap_API.py which finds nearest public transport stop as the crow flies

  for (let feature of features) {
    if (feature.geometry.type != "LineString") {
      continue;
    }

    var stops = [];
    for (const pt of feature.geometry.coordinates) {
      const req = {
        lat_long: [pt[1], pt[0]],
        acceptable_distance: stopSnapDistance,
      };
      console.log(`Lookup stop ${JSON.stringify(req)}`);

      const resp = await fetch(stopLookupEndpt, {
        method: "POST",
        headers: jsonRequestHeaders(),
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
  }
}

function jsonRequestHeaders() {
  return {
    // TODO Re-evaluate why/if this is needed
    "Bypass-Tunnel-Reminder": "haha",
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}
