export async function findStopsPreApiCall(features_all) {

  // Loops through all features which are 'type' === 'service' and finds ATCO codes
  // of existing stops
  // This goes to Snap_API.py which finds nearest public transport stop as the crow flies

  const endpt = "https://cuddly-islands-stick-34-89-73-233.loca.lt";

  for (var i = 0; i < features_all.length; i++) {

    let feature = features_all[i]


    /// No need to find closest PT stops for new build features
    if (feature['type'] === 'newbuild') {
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

    feature['stop_ATCOs'] = stops
    features_all[i] = feature

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
  var new_builds_array = []


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

    let feature = features_all[i]

    /// extract data for request payload
    if (feature['type'] === 'newbuild') {
        new_builds_array.push([feature.purpose, feature.centroid_latlong, feature.form_value]) 
    } else {

        /// new service
        var stops = feature['stop_ATCOs']
        var lastTime = 3600 * startHours;
        var iterations = dailyTrips * stops.length


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

      i_so_far = i_so_far + iterations
    }
  }

  // add data on new build sites
  req['new_buildings'] = new_builds_array

  return callAPI(req)
}



export async function callAPI(req) {

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


