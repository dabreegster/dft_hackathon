<script>
  import { NumberInput, TextInput } from "carbon-components-svelte";
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

<p>Route length: {Math.ceil(props.lengthKm)}km</p>

<TextInput labelText="Name" bind:value={props.name} />

<br />

<NumberInput label="Speed of the train (km/h)" bind:value={props.speed} />

<br />

<NumberInput
  label="Peak frequency of the train (minutes)"
  bind:value={props.frequency}
/>

<br />

<div>
  <button type="button" on:click={remove}>Delete</button>
  <button type="button" on:click={clearCurrentlyEditing} style="float: right;"
    >Save</button
  >
</div>
