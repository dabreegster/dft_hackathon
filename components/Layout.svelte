<div class="left">
  <slot name="left" />
</div>
<div class="main">
  <slot name="main" />
</div>
<div class="right">
  <slot name="right" />
</div>

<style>
  div {
    float: left;
  }

  .left {
    width: 25%;
  }
  .right {
    width: 15%;
  }
  .main {
    width: 60%;
  }
</style>
