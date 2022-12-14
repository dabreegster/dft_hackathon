<script>
  import MapboxDraw from "@mapbox/mapbox-gl-draw";
  import length from "@turf/length";
  import centroid from "@turf/centroid";
  import area from "@turf/area";
  import {
    isPoint,
    drawCircle,
    isLine,
    drawLine,
    isPolygon,
    drawPolygon,
  } from "../style.js";
  import { onMount, getContext } from "svelte";

  import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

  const { getMap } = getContext("map");
  import {
    gjScheme,
    currentMapHover,
    setCurrentlyEditing,
    clearCurrentlyEditing,
    currentlyEditing,
  } from "../stores.js";

  const color = "black";
  const circleRadius = 7;
  const lineWidth = 10;
  const styles = [
    {
      id: "draggable-points",
      filter: ["all", isPoint, ["!=", "meta", "feature"]],
      // TODO The 1.5 is bulky and ugly, but I can't figure out how to get z-ordering working
      ...drawCircle("blue", 1.5 * circleRadius),
    },
    {
      id: "base-line",
      filter: isLine,
      ...drawLine(color, lineWidth),
    },
    {
      id: "base-polygon-fill",
      filter: isPolygon,
      ...drawPolygon(color, 0.1),
    },
    {
      id: "base-polygon-outline",
      filter: isPolygon,
      ...drawLine(color, lineWidth / 2.0),
    },
  ];

  let drawControls;

  onMount(async () => {
    const map = getMap();

    drawControls = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        polygon: true,
      },
      styles: styles,
    });
    map.addControl(drawControls);

    // When we draw a new feature, add it to the store
    map.on("draw.create", (e) => {
      // Assume there's exactly 1 feature
      const feature = e.features[0];
      addGeometricProperties(feature);
      gjScheme.update((gj) => {
        gj.features.push(feature);
        return gj;
      });
    });

    map.on("draw.update", (e) => {
      // Assume there's exactly 1 feature
      const feature = e.features[0];
      addGeometricProperties(feature);

      gjScheme.update((gj) => {
        const update = gj.features.find((f) => f.id == feature.id);
        update.geometry = feature.geometry;
        // Overwrite any geometric properties
        update.properties = { ...update.properties, ...feature.properties };
        return gj;
      });
    });

    map.on("draw.selectionchange", (e) => {
      if (e.features.length == 1) {
        setCurrentlyEditing(e.features[0].id);
      } else if (e.features.length == 0) {
        clearCurrentlyEditing();
      }
    });

    // When the store changes, update the drawn objects
    // TODO Form changes will trigger this unnecessarily. Maybe split out geometry and properties?
    gjScheme.subscribe((gj) => {
      drawControls.set(gj);
    });

    // Highlight something in the sidebar when we hover on a feature in the map
    map.on("mousemove", (e) => {
      var newHoverEntry = null;
      // TODO This whines about a layer missing, and I can't suppress with try/catch
      const ids = drawControls.getFeatureIdsAt(e.point);
      if (ids.length > 0) {
        newHoverEntry = ids[0];
      }
      currentMapHover.set(newHoverEntry);
    });
    map.on("mouseout", () => {
      currentMapHover.set(null);
    });

    currentlyEditing.subscribe((id) => {
      if (id) {
        let feature = $gjScheme.features.find((f) => f.id == id);
        drawControls.changeMode("direct_select", {
          featureId: feature.id,
        });
      }
    });
  });

  function addGeometricProperties(feature) {
    if (feature.geometry.type == "LineString") {
      feature.properties.lengthKm = length(feature.geometry);
    } else {
      feature.properties.centroid = centroid(feature.geometry);
      feature.properties.areaSquareMeters = area(feature.geometry);
    }
  }
</script>

<style>
  :global(.mapboxgl-ctrl-group > button) {
    width: 60px;
    height: 60px;
  }

  :global(.mapbox-gl-draw_polygon, .mapbox-gl-draw_line) {
    background-size: 50px;
  }
</style>
