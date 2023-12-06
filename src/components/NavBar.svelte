<script>
  export let title;
</script>

<nav>
  <h1>{title}</h1>
  <div class="slot-content">
    <slot />
  </div>
</nav>

<style>
  h1 {
    text-align: center;
    color: #ffffff;
  }

  .slot-content {
    margin-left: auto;
  }
</style>
