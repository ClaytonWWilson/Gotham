<script lang="ts">
  import type AwaitedQueueProcessor from "../lib/AwaitedQueueProcessor";

  export let queue;
</script>

<section />

<style>
  section {
    overflow-y: scroll;
    overflow-x: hidden;
    height: 340px;
  }

  div {
    display: grid;
    width: 100%;
    column-gap: 5px;
    grid-template-columns: 10% 35% 5% 45%;
    border: 1px solid black;
    color: black;
    height: 30px;
  }

  .action {
    color: blue;
  }

  .profile-name {
    color: green;
  }

  .room-name {
    color: purple;
  }

  .failure-reason {
    color: red;
  }
</style>
