<script>
  // TODO Share with BaseScoreLayer
  let colors = [
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061",
  ];

  export let hoveredAreaScores;
</script>

<div class="legend">
  {#each colors as color, i}
    <div class="square" style="background-color: {color}">
      &gt; {i * 10}
    </div>
  {/each}
</div>

{#if hoveredAreaScores}
  {#each Object.entries(hoveredAreaScores) as [key, value]}
    <p>{key} = {value}</p>
  {/each}
{:else}
  <p>Hover on area to see scores</p>
{/if}

<style>
  .legend {
    display: flex;
  }

  .square {
    width: 50px;
    height: 50px;
    color: white;
    padding: 5px;
  }
</style>
