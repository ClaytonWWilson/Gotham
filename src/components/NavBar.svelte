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
  /* nav {
    display: flex;
  } */

  h1 {
    text-align: center;
    color: #ffffff;
    /* padding-left: 30px;
    margin-top: 0px;
    margin-bottom: 0px; */
  }

  .slot-content {
    margin-left: auto;
  }
</style>
