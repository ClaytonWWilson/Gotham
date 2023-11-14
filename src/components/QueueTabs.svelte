<script>
  import { createEventDispatcher } from "svelte";

  export let selected;

  const dispatch = createEventDispatcher();

  const tabClickHandler = (selected) => {
    dispatch("tabclick", { selected });
  };
</script>

<section>
  <div
    class={`${selected == "Queue" ? "selected" : ""}`}
    on:click={() => tabClickHandler("Queue")}
    role="button"
    tabindex="-1"
    on:keydown={() => {}}
  >
    Queue (0)
  </div>
  <div
    class={`${selected == "Running" ? "selected" : ""}`}
    on:click={() => tabClickHandler("Running")}
    role="button"
    tabindex="-1"
    on:keydown={() => {}}
  >
    Running (0)
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
