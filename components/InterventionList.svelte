<script>
  import { Accordion, AccordionItem } from "carbon-components-svelte";
  import BuildingForm from "./BuildingForm.svelte";
  import RouteForm from "./RouteForm.svelte";
  import DebugApi from "./DebugApi.svelte";
  import {
    gjScheme,
    currentSidebarHover,
    currentMapHover,
    currentlyEditing,
  } from "../stores.js";
  import { geojsonToApiPayload, callApi } from "../api.js";

  let requestJson;
  let responseJson;

  function interventionName(feature) {
    if (feature.properties.name) {
      return feature.properties.name;
    }
    if (feature.geometry.type == "LineString") {
      return "Untitled route";
    }
    return "Untitled building";
  }

  // TODO Not sure why we can't inline this one below
  function reset() {
    currentSidebarHover.set(null);
  }

  function closeOtherForms(id) {
    for (let f of $gjScheme.features) {
      if (f.properties.editing && f.id != id) {
        delete f.properties.editing;
        return;
      }
    }
  }

  // TODO Disable the button and show loading state
  async function recalculate() {
    requestJson = await geojsonToApiPayload($gjScheme.features);
    responseJson = await callApi(requestJson);
  }
</script>

<Accordion>
  {#each $gjScheme.features as feature, i}
    <AccordionItem
      bind:open={feature.properties.editing}
      on:click={closeOtherForms(feature.id)}
      on:mouseenter={currentSidebarHover.set(feature.id)}
      on:mouseleave={reset}
    >
      <svelte:fragment slot="title">
        {#if feature.id == $currentMapHover}
          <strong>{i + 1}) {interventionName(feature)}</strong>
        {:else}
          {i + 1}) {interventionName(feature)}
        {/if}
      </svelte:fragment>
      {#if feature.geometry.type == "LineString"}
        <RouteForm id={feature.id} bind:props={feature.properties} />
      {:else}
        <BuildingForm id={feature.id} bind:props={feature.properties} />
      {/if}
    </AccordionItem>
  {/each}
</Accordion>

<button
  type="button"
  disabled={$gjScheme.features.length == 0}
  on:click={recalculate}>Recalculate scores</button
>
<DebugApi {requestJson} {responseJson} />
