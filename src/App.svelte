<script lang="ts">
  import Router, { link, push } from "svelte-spa-router";
  import NavBar from "./components/NavBar.svelte";
  import { fetchChimeContacts, fetchChimeRooms } from "./lib/fetchToState";
  import { getIntersection, leftPad } from "./lib/utilites";
  import { routes } from "./routes.js";
  import { roomList, runningQueue, settings } from "./stores";
  import type { APIAction, APIRequest } from "./types/api";

  export let rootId: string;

  let navTitle = "Gotham - Home";

  async function autoHideRooms() {
    const openHideableRooms = new Map<string, { joinedAt: Date }>();

    window.addEventListener("locationchange", (e: Event) => {
      const eventWindow = e.currentTarget as Window;
      const currentUrl = eventWindow.location.href;
      const enteredRoomId = currentUrl
        .slice(currentUrl.lastIndexOf("/") + 1)
        .replaceAll("/", "");

      if (openHideableRooms.has(enteredRoomId)) {
        openHideableRooms.set(enteredRoomId, { joinedAt: new Date() });
      }
    });

    setInterval(
      () => {
        if (!$settings.autoHideEnabled) return;

        const visibleRoomsContainerElement = document.querySelector(
          "#app > div.LayoutRoute > div > nav > div.Sidebar__discussions > div.RoomList > div.SortableList"
        );

        if (!visibleRoomsContainerElement) {
          console.error("Can't find Chime rooms list");
          return;
        }

        const visibleRoomsElements = visibleRoomsContainerElement.children;
        const visibleRoomIds = new Set<string>();
        for (let i = 0; i < visibleRoomsElements.length; i++) {
          const roomElement = visibleRoomsElements[i];
          const anchor = roomElement.children[0] as
            | HTMLAnchorElement
            | undefined;

          if (!anchor) {
            console.error("Can't find channel link");
            return;
          }

          const link = anchor.href;
          const roomId = link
            .slice(link.lastIndexOf("/") + 1)
            .replaceAll("/", "");

          visibleRoomIds.add(roomId);
        }

        let autoHideRoomIds = getIntersection(
          visibleRoomIds,
          $settings.autoHideRooms
        );

        const now = new Date();
        const currentUrl = window.location.href;
        const currentRoomId = currentUrl
          .slice(currentUrl.lastIndexOf("/") + 1)
          .replaceAll("/", "");
        if (openHideableRooms.has(currentRoomId)) {
          openHideableRooms.set(currentRoomId, { joinedAt: now });
        }

        autoHideRoomIds.forEach((roomId) => {
          let stored: { joinedAt: Date } | undefined =
            openHideableRooms.get(roomId);

          if (!stored) {
            stored = { joinedAt: now };
            openHideableRooms.set(roomId, stored);
          }

          if (
            now.valueOf() - stored.joinedAt.valueOf() >
            $settings.autoHideWaitSeconds * 1000
          ) {
            let request: APIRequest = {
              endpoint: `https://api.express.ue1.app.chime.aws/msg/rooms/${roomId}`,
              method: "POST",
              payload: {
                RoomId: roomId,
                Visibility: "hidden",
              },
            };
            let action: APIAction = {
              request,
              action: "HIDE",
              createdAt: new Date(),
              displayMessage: `Auto-hide room ${roomId}`,
              status: "QUEUED",
              retries: 5,
            };
            $runningQueue.enqueue(action);
          }
        });

        $runningQueue = $runningQueue;
        $runningQueue.run();

        openHideableRooms.forEach((_, storedId) => {
          if (!autoHideRoomIds.has(storedId)) {
            openHideableRooms.delete(storedId);
          }
        });
      },
      1 * 60 * 1000
    );
  }

  fetchChimeRooms();
  fetchChimeContacts();
  autoHideRooms();

  let appOpen = false;

  function hideApp() {
    appOpen = !appOpen;
    push("/");
    navTitle = "Gotham - Home";
  }
</script>

<div id={rootId}>
  <button class="gotham-button" on:click={hideApp}> Gotham </button>
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
        {#if $roomList.updatedAt}
          <span class="last-updated"
            >{`Last updated at ${$roomList.updatedAt.getHours()}:${leftPad(
              $roomList.updatedAt.getMinutes().toFixed(),
              2,
              "0"
            )}`}</span
          >
        {/if}
      </NavBar>
      <Router {routes} />
    </div>
  </div>
</div>

<style>
  button {
    color: white;
  }

  .gotham-button {
    display: inline-block;
  }

  .last-updated {
    color: gray;
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
</style>
