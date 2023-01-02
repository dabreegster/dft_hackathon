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
  export let name;
  export let purpose;
  export let num_people;
  export let num_jobs;
  export let square_meters;

  function remove() {
    gjScheme.update((gj) => {
      gj.features = gj.features.filter((f) => f.id != id);
      return gj;
    });
  }
</script>

<TextInput labelText="Name" bind:value={name} />

<br />

<Select labelText="Purpose" bind:selected={purpose}>
  <SelectItem text="Residential" value="residential" />
  <SelectItem text="Business" value="business" />
  <SelectItem text="Shopping" value="shopping" />
  <SelectItem text="Leisure" value="leisure" />
  <SelectItem text="Education" value="education" />
</Select>

<br />

{#if purpose == "residential"}
  <NumberInput label="Number of people to live here" bind:value={num_people} />
{:else if purpose == "business"}
  <NumberInput label="Number of jobs" bind:value={num_jobs} />
{:else}
  <NumberInput
    label="Total square meters of floor-space"
    bind:value={square_meters}
  />
{/if}

<div>
  <button type="button" on:click={remove}>Delete</button>
  <button type="button" on:click={clearCurrentlyEditing} style="float: right;"
    >Save</button
  >
</div>
