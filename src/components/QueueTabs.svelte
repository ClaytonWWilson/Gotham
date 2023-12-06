<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    plannedQueue,
    runningQueue,
    finishedQueue,
    failedQueue,
  } from "../stores";

  export let selected: string;

  const dispatch = createEventDispatcher();

  function tabClickHandler(s: string) {
    dispatch("tabclick", { selected: s });
  }
</script>

<section>
  <div
    class={`${selected == "Planned" ? "selected" : ""}`}
    on:click={() => tabClickHandler("Planned")}
    role="button"
    tabindex="-1"
    on:keydown={() => {}}
  >
    Planned ({$plannedQueue.length})
  </div>
  <div
    class={`${selected == "Running" ? "selected" : ""}`}
    on:click={() => tabClickHandler("Running")}
    role="button"
    tabindex="-1"
    on:keydown={() => {}}
  >
    Running ({$runningQueue.length})
  </div>
  <div
    class={`${selected == "Finished" ? "selected" : ""}`}
    on:click={() => tabClickHandler("Finished")}
    role="button"
    tabindex="-1"
    on:keydown={() => {}}
  >
    Finished ({$finishedQueue.length})
  </div>
  <div
    class={`${selected == "Failed" ? "selected" : ""}`}
    on:click={() => tabClickHandler("Failed")}
    role="button"
    tabindex="-1"
    on:keydown={() => {}}
  >
    Failed ({$failedQueue.length})
  </div>
</section>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: auto;
    height: 30px;
    background-color: gray;
    border: 1px solid black;
    color: white;
    user-select: none;
  }

  section {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  .selected {
    background-color: darkgray;
  }
</style>
