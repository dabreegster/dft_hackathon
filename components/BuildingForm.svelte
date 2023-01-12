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
  <SelectItem text="Allotment" value="Allotment" />
  <SelectItem text="Amusement Park" value="Amusement Park" />
  <SelectItem text="Amusements" value="Amusements" />
  <SelectItem text="Arena / Stadium" value="Arena / Stadium" />
  <SelectItem text="Bank" value="bank" />
  <SelectItem text="Bingo Hall / Cinema / Conference / Exhibition Centre / Theatre / Concert Hall" value="Bingo Hall / Cinema / Conference / Exhibition Centre / Theatre / Concert Hall" />
  <SelectItem text="Business" value="Business" />
  <SelectItem text="Campsite" value="Campsite" />
  <SelectItem text="Conference / Exhibition Centre " value="Conference / Exhibition Centre " />
  <SelectItem text="Education: Further" value="further education" />
  <SelectItem text="Education: Pre-school/Nursery" value="pre school nursery" />
  <SelectItem text="Education: Primary school" value="Primary school" />
  <SelectItem text="Education: Secondary School" value="Secondary School" />
  <SelectItem text="Education: Special Needs Establishment" value="special needs establishment" />
  <SelectItem text="Education: university" value="university" />
  <SelectItem text="Historic" value="historic" />
  <SelectItem text="Leisure (generic)" value="Leisure (generic)" />
  <SelectItem text="Library" value="Library" />
  <SelectItem text="Motor sports" value="Motor sports" />
  <SelectItem text="Museum" value="Museum" />
  <SelectItem text="Pub/Nightclub" value="pub_nightclub" />
  <SelectItem text="Recreation and Sports Ground" value="Recreation and Sports Ground" />
  <SelectItem text="Residential" value="Visit friends at private home" />
  <SelectItem text="Retail: Food" value="food_retail" />
  <SelectItem text="Retail: Garden" value="gardening_retail" />
  <SelectItem text="Retail: Generic" value="retail_generic" />
  <SelectItem text="Retail: Petrol" value="petrol_retail" />
  <SelectItem text="Retail: Shop" value="retail_shop" />
  <SelectItem text="Royal Mail Infrastructure" value="royal_mail_infrastructure" />
  <SelectItem text="Spiritual/Religious" value="spiritual_religious" />
  <SelectItem text="Theatre" value="Theatre" />
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
