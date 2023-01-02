<script>
  import {
    RadioButtonGroup,
    RadioButton,
    TextInput,
  } from "carbon-components-svelte";
  import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";
  import { gjScheme, clearCurrentlyEditing } from "../stores.js";

  export let id;
  export let name;
  export let purpose;

  function remove() {
    gjScheme.update((gj) => {
      gj.features = gj.features.filter((f) => f.id != id);
      return gj;
    });
  }
</script>

<TextInput labelText="Name" bind:value={name} />

<br />

<RadioButtonGroup bind:selected={purpose}>
  <RadioButton labelText="Residential" value="residential" />
  <RadioButton labelText="Business" value="business" />
  <RadioButton labelText="Other" value="other" />
</RadioButtonGroup>

<br />

<div>
  <button type="button" on:click={remove}>Delete</button>
  <button type="button" on:click={clearCurrentlyEditing} style="float: right;"
    >Save</button
  >
</div>
