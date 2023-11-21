<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { plannedQueue, runningQueue } from "../stores";

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
    Finished (0)
  </div>
  <div
    class={`${selected == "Failed" ? "selected" : ""}`}
    on:click={() => tabClickHandler("Failed")}
    role="button"
    tabindex="-1"
    on:keydown={() => {}}
  >
    Failed (0)
  </div>
</section>

<style>
  section {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

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

  .selected {
    background-color: darkgray;
  }
</style>
