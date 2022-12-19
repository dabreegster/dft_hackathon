export async function loadBaselineData() {
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

export function setupLSOALayer(map, layerId) {
  if (document.getElementById("lsoacheck").checked) {
    if (map.getLayer("baseline_layer")) {
      map.removeLayer("baseline_layer");
    }
    map.addLayer({
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
  } else if (map.getLayer("baseline_layer")) {
    map.removeLayer("baseline_layer");
  }
}
