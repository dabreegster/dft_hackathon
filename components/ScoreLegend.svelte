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
</script>

{#each colors as color, i}
  <div style="background-color: {color}">
    &gt; {i * 10}
  </div>
{/each}

<style>
  div {
    width: 50px;
    height: 50px;
    color: white;
    padding: 5px;
  }
</style>
