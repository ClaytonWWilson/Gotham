<script lang="ts">
  import { onMount } from "svelte";
  export let rootId: string;

  import { createPopper } from "@popperjs/core";
  import NavBar from "./components/NavBar.svelte";
  import Router, { link } from "svelte-spa-router";
  import { routes } from "./routes.js";
  import { fetchChimeContacts, fetchChimeRooms } from "./lib/fetchToState";

  let navTitle = "Gotham - Home";

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

  // Hides the popover when the user clicks outside of it
  document.addEventListener("click", (event) => {
    let node = event.target as HTMLElement;

    while (node != document.body) {
      if (node.id && node.id === rootId) {
        return;
      }
      node = node.parentElement;
    }

    popperContent.style.display = "none";
  });

  fetchChimeRooms();
  fetchChimeContacts();
</script>

<div id={rootId}>
  <button class="gotham-button" on:click={makePopper} bind:this={gothamButton}>
    Open
  </button>
  <div class="popper-content" role="dialog" bind:this={popperContent}>
    <NavBar title={navTitle}>
      <a href="/" use:link on:click={() => (navTitle = "Gotham - Home")}>Home</a
      >
      <a
        href="/addjob"
        use:link
        on:click={() => (navTitle = "Gotham - New Job")}>Add</a
      >
      <a
        href="/settings"
        use:link
        on:click={() => (navTitle = "Gotham - Settings")}>Settings</a
      >
    </NavBar>
    <Router {routes} />
  </div>
</div>

<style>
  .gotham-button {
    display: inline-block;
  }

  .popper-content {
    z-index: 100;
    display: inline-block;
    background-color: #303030;
    color: black;
    font-weight: bold;
    font-size: 13px;
    border-radius: 4px;
    height: 450px;
    width: 350px;
    margin-right: 10px;
  }
</style>
