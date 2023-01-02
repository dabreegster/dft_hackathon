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
</script>

<Layout>
  <div slot="sidebar">
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
      <BaseScoreLayer />
      <StopsLayer />
    </Map>
  </div>
</Layout>
