<script lang="ts">
  import { onMount } from "svelte";
  import Main from "./components/Main.svelte";
  export let rootId: string;

  import { createPopper } from "@popperjs/core";
  import Queue from "./Utilities/Queue";
  import AwaitedQueueProcessor from "./Utilities/AwaitedQueueProcessor";
  import { sleepms } from "./Utilities/utilites";

  let gothamButton: HTMLElement;
  let popperContent: HTMLElement;

  const makePopper = () => {
    if (popperContent.style.display === "none") {
      popperContent.style.display = "inline-block";
    } else {
      popperContent.style.display = "none";
    }

    createPopper(gothamButton, popperContent, {
      placement: "bottom",
    });
  };

  onMount(() => (popperContent.style.display = "none"));

  const waitAndLog = (message: string, ms: number) => {
    return new Promise<void>((resolve) => {
      sleepms(ms).then(() => {
        console.log(message);
        resolve();
      });
    });
  };

  const testQueue = () => {
    let q = new Queue<number>();
    let qp = new AwaitedQueueProcessor(
      q,
      async (num) => {
        waitAndLog("waited for " + num, 0);
      },
      10000
    );

    q.enqueue(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
    qp.run();
  };
</script>

<div id={rootId}>
  <button
    id="gotham-button"
    on:click={makePopper}
    on:click={testQueue}
    bind:this={gothamButton}
  >
    Open
  </button>
  <div id="popper-content" role="dialog" bind:this={popperContent}>
    <Main />
  </div>
</div>

<style>
  #gotham-button {
    display: inline-block;
  }

  #popper-content {
    z-index: 100;
  }
</style>
