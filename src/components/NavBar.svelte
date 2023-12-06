<script lange="ts">
  import pkg from "../../package.json";
  export let title;
</script>

<nav>
  <span>{`version: ${pkg.version}`}</span>
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

  nav {
    width: 100%;
  }

  span {
    color: gray;
    position: absolute;
    right: 1.5rem;
  }

  .slot-content {
    margin-left: auto;
  }
</style>
