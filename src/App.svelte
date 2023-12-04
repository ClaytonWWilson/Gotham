<script lang="ts">
  // import { onMount } from "svelte";
  export let rootId: string;

  // import { createPopper } from "@popperjs/core";
  import NavBar from "./components/NavBar.svelte";
  import Router, { link } from "svelte-spa-router";
  import { routes } from "./routes.js";
  import { fetchChimeContacts, fetchChimeRooms } from "./lib/fetchToState";
  import { settings } from "./stores";

  let navTitle = "Gotham - Home";

  // let gothamButton: HTMLElement;
  // let popperContent: HTMLElement;

  // const makePopper = () => {
  //   if (popperContent.style.display === "none") {
  //     popperContent.style.display = "inline-block";
  //   } else {
  //     popperContent.style.display = "none";
  //   }

  //   createPopper(gothamButton, popperContent, {
  //     placement: "bottom",
  //   });
  // };

  // onMount(() => (popperContent.style.display = "none"));

  // // Hides the popover when the user clicks outside of it
  // document.addEventListener("click", (event) => {
  //   let node = event.target as HTMLElement;

  //   while (node != document.body) {
  //     if (node.id && node.id === rootId) {
  //       return;
  //     }
  //     node = node.parentElement;
  //   }

  //   popperContent.style.display = "none";
  // });

  fetchChimeRooms();
  fetchChimeContacts();

  settings.subscribe((newSettings) => {
    localStorage.setItem("gothamSettings", JSON.stringify(newSettings));
  });

  let appOpen = false;

  function toggleModal() {
    appOpen = !appOpen;
  }
</script>

<div id={rootId}>
  <button class="gotham-button" on:click={toggleModal}> Open </button>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="modal"
    class:show-modal={appOpen}
    on:click={() => {
      appOpen = false;
    }}
  >
    <div class="modal-content" on:click|stopPropagation={() => {}}>
      <NavBar title={navTitle}>
        <a href="/" use:link on:click={() => (navTitle = "Gotham - Home")}
          >Home</a
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
        <button
          on:click={() => {
            fetchChimeRooms();
            fetchChimeContacts();
          }}>Refresh Data</button
        >
      </NavBar>
      <Router {routes} />
    </div>
  </div>
  <!-- <div class="popper-content" role="dialog" bind:this={popperContent}>
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
  </div> -->
</div>

<style>
  .gotham-button {
    display: inline-block;
  }

  .modal {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transform: scale(1.1);
    transition:
      visibility 0s linear 0.25s,
      opacity 0.25s 0s,
      transform 0.25s;
  }

  .show-modal {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    transition:
      visibility 0s linear 0s,
      opacity 0.25s 0s,
      transform 0.25s;
    z-index: 2;
  }

  .modal-content {
    display: grid;
    grid-template-rows: 60px auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #303030;
    color: black;
    font-weight: bold;
    z-index: 100;
    padding: 1rem 1.5rem;
    width: 50rem;
    border-radius: 0.5rem;
    height: 80%;
    justify-items: center;
    font-size: 13px;
  }

  /* .popper-content {
    z-index: 100;
    display: inline-block;
    font-size: 13px;
    background-color: #303030;
    color: black;
    font-weight: bold;
    border-radius: 4px;
    height: 450px;
    width: 600px;
    margin-right: 10px;
  } */
</style>
