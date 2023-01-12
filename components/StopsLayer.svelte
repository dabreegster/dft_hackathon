<script>
  import geojsonUrl from "../data/stops_for_app_all_PT.geojson?url";
  import { onMount, getContext } from "svelte";

  const { getMap } = getContext("map");
  const map = getMap();

  const source = "all_stops";
  const layer = "all_stops_layer";

  let show = false;

  onMount(() => {
    map.addSource(source, {
      type: "geojson",
      data: geojsonUrl,
    });
    map.addLayer({
      id: layer,
      source: source,
      type: "circle",
      paint: {
        "circle-radius": 5,
        "circle-color": "purple",
        "circle-opacity": 0.5,
      },
    });
    toggle();
  });

  function toggle() {
    map.setLayoutProperty(layer, "visibility", show ? "visible" : "none");
  }
</script>

<div>
  Show NaPTAN stops: <input
    type="checkbox"
    bind:checked={show}
    on:change={toggle}
  />
</div>

<style>
  div {
    z-index: 1;
    position: absolute;
    bottom: 210px;
    right: 10px;
    background: white;
    padding: 10px;
  }
</style>
