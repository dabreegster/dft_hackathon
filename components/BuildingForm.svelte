<script>
  import {
    SelectItem,
    Select,
    TextInput,
    NumberInput,
  } from "carbon-components-svelte";
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
  <SelectItem text="Residential" value="Residential" />
  <SelectItem text="Business" value="Business" />
  <SelectItem text="Shopping" value="Shopping" />
  <SelectItem text="Leisure" value="Leisure" />
  <SelectItem text="Education" value="Education" />
</Select>

<br />

{#if props.purpose == "Residential"}
  <NumberInput
    label="Number of people to live here"
    bind:value={props.num_people}
  />
{:else if props.purpose == "Business"}
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
