<script>
  import Map from "./components/Map.svelte";
  import Layout from "./components/Layout.svelte";
  import DrawControls from "./components/DrawControls.svelte";
  import InterventionList from "./components/InterventionList.svelte";
  import EntireScheme from "./components/EntireScheme.svelte";
  import HoverLayer from "./components/HoverLayer.svelte";
  import EditingLayer from "./components/EditingLayer.svelte";
  import BaseScoreLayer from "./components/BaseScoreLayer.svelte";
  import StopsLayer from "./components/StopsLayer.svelte";
  import ScoreLegend from "./components/ScoreLegend.svelte";

  let hoveredAreaScores;
</script>

<Layout>
  <div slot="left">
    <h1>Connectivity prototype</h1>
    <EntireScheme />
    <br />
    <InterventionList />
  </div>
  <div slot="main">
    <Map>
      <DrawControls />
      <HoverLayer />
      <EditingLayer />
      <BaseScoreLayer bind:hoveredAreaScores />
      <StopsLayer />
    </Map>
  </div>
  <div slot="right">
    <ScoreLegend {hoveredAreaScores} />
  </div>
</Layout>
