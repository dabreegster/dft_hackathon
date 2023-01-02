<script>
  import {
    SelectItem,
    Select,
    TextInput,
    NumberInput,
  } from "carbon-components-svelte";
  import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";
  import { gjScheme, clearCurrentlyEditing } from "../stores.js";

  export let id;
  export let props;

  function remove() {
    gjScheme.update((gj) => {
      gj.features = gj.features.filter((f) => f.id != id);
      return gj;
    });
  }
</script>

<TextInput labelText="Name" bind:value={props.name} />

<br />

<Select labelText="Purpose" bind:selected={props.purpose}>
  <SelectItem text="Residential" value="residential" />
  <SelectItem text="Business" value="business" />
  <SelectItem text="Shopping" value="shopping" />
  <SelectItem text="Leisure" value="leisure" />
  <SelectItem text="Education" value="education" />
</Select>

<br />

{#if props.purpose == "residential"}
  <NumberInput
    label="Number of people to live here"
    bind:value={props.num_people}
  />
{:else if props.purpose == "business"}
  <NumberInput label="Number of jobs" bind:value={props.num_jobs} />
{:else}
  <NumberInput
    label="Total square meters of floor-space"
    bind:value={props.areaSquareMeters}
  />
{/if}

<div>
  <button type="button" on:click={remove}>Delete</button>
  <button type="button" on:click={clearCurrentlyEditing} style="float: right;"
    >Save</button
  >
</div>
