<script lang="ts">
  import { onMount } from "svelte";
  import Main from "./components/Main.svelte";
  export let rootId: string;

  import { createPopper } from "@popperjs/core";
  import { sleepms } from "./lib/utilites";

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
</script>

<div id={rootId}>
  <button id="gotham-button" on:click={makePopper} bind:this={gothamButton}>
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
