<script>
  import { NumberInput, TextInput } from "carbon-components-svelte";
  import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";
  import { gjScheme, clearCurrentlyEditing } from "../stores.js";

  export let id;
  export let name;
  export let speed;
  export let frequency;

  function remove() {
    gjScheme.update((gj) => {
      gj.features = gj.features.filter((f) => f.id != id);
      return gj;
    });
  }
</script>

<TextInput labelText="Name" bind:value={name} />

<br />

<NumberInput label="Speed of the train (km/h)" bind:value={speed} />

<br />

<NumberInput
  label="Peak frequency of the train (minutes)"
  bind:value={frequency}
/>

<br />

<div>
  <button type="button" on:click={remove}>Delete</button>
  <button type="button" on:click={clearCurrentlyEditing} style="float: right;"
    >Save</button
  >
</div>
