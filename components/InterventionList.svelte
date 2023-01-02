<script>
  import { Accordion, AccordionItem } from "carbon-components-svelte";
  import BuildingForm from "./BuildingForm.svelte";
  import RouteForm from "./RouteForm.svelte";
  import {
    gjScheme,
    currentSidebarHover,
    currentMapHover,
    currentlyEditing,
  } from "../stores.js";

  function interventionName(feature) {
    if (feature.properties.name) {
      return feature.properties.name;
    }
    if (feature.geometry.type == "LineString") {
      return "Untitled route";
    }
    return "Untitle building";
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
        <RouteForm
          id={feature.id}
          bind:name={feature.properties.name}
          bind:speed={feature.properties.speed}
          bind:frequency={feature.properties.frequency}
        />
      {:else}
        <BuildingForm
          id={feature.id}
          bind:name={feature.properties.name}
          bind:purpose={feature.properties.purpose}
          <
        />
      {/if}
    </AccordionItem>
  {/each}
</Accordion>
