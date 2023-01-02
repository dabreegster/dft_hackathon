// Returns the baseline GeoJSON data and also a dictionary from LSOA ID to geometry
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
