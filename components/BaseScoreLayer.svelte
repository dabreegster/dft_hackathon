<script>
  import geojsonUrl from "../data/lsoa_scores.geojson?url";
  import { onMount, getContext } from "svelte";

  const { getMap } = getContext("map");
  const map = getMap();

  const source = "baseline";
  const layer = "baseline_layer";

  export let hoveredAreaScores;

  let scoreLayer = "overall";

  onMount(() => {
    map.addSource(source, {
      type: "geojson",
      data: geojsonUrl,
    });
    setLayer();

    map.on("mousemove", layer, function (e) {
      if (e.features.length > 0) {
        hoveredAreaScores = e.features[0].properties;
      }
    });
    map.on("mouseleave", layer, function (e) {
      hoveredAreaScores = null;
    });
  });

  function setLayer() {
    if (map.getLayer(layer)) {
      map.removeLayer(layer);
    }
    if (scoreLayer != "hide") {
      map.addLayer({
        id: layer,
        source: source,
        type: "fill",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", scoreLayer],
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

  function scoreTypes() {
    let purposes = [
      "Business",
      "Education",
      "Shopping",
      "Visit_friends_at_private_home",
      "Entertain_public_activity",
    ];
    let modes = ["car", "walk", "cycling", "pt"];
    let all = ["hide", "overall"];

    for (let mode of modes) {
      all.push(`overall_${mode}`);
    }

    for (let purpose of purposes) {
      all.push(`overall_${purpose.toLowerCase()}`);
      for (let mode of modes) {
        all.push(`${purpose}_${mode}`);
      }
    }
    return all;
  }
</script>

<div>
  Show LSOA scores:
  <select bind:value={scoreLayer} on:change={setLayer}>
    {#each scoreTypes() as x}
      <option value={x}>{x}</option>
    {/each}
  </select>
</div>

<style>
  div {
    z-index: 1;
    position: absolute;
    bottom: 250px;
    right: 10px;
    background: white;
    padding: 10px;
  }

  select {
    font-size: 16px;
    padding: 4px 8px;
  }
</style>
