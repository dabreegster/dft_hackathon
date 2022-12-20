export async function recalculateRouteScores(feature) {
  // First we need to snap each of the points to a valid stop
  const endpt = "https://true-swans-flow-34-89-73-233.loca.lt";

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
  console.log(`Got stops ${stops}`);

  return callAPI(feature, stops);
}

export async function recalculateBuildingScores(feature, purpose, form_value) {
  alert(`TODO: call api for ${purpose} and ${form_value}`);
}

async function callAPI(feature, stops) {
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
  const resp = await fetch(realEndpt, {
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
