<script lang="ts">
  import Router, { link, push, RouteLoadingEvent } from "svelte-spa-router";
  import NavBar from "./components/NavBar.svelte";
  import { fetchChimeContacts, fetchChimeRooms } from "./lib/fetchToState";
  import { getIntersection, leftPad } from "./lib/utilites";
  import { routes } from "./routes.js";
  import { currentLocation, roomList, runningQueue, settings } from "./stores";
  import { logger } from "./loggerStore";
  import type { APIAction, APIRequest, ChimeRoom } from "./types/api";
  import GothamIcon from "./icons/GothamIcon.svelte";

  export let rootId: string;

  // Catch page navigations and refreshes to write all logs to tampermonkey storage
  window.onbeforeunload = (e: BeforeUnloadEvent) => {
    $logger.debug("Page closed or refreshed", e);
    $logger.flush();
  };

  async function autoHideRooms() {
    const openHideableRooms = new Map<
      string,
      { joinedAt: Date; name: string }
    >();

    window.addEventListener("locationchange", (e: Event) => {
      const eventWindow = e.currentTarget as Window;
      const currentUrl = eventWindow.location.href;
      const enteredRoomId = currentUrl
        .slice(currentUrl.lastIndexOf("/") + 1)
        .replaceAll("/", "");

      let enteredRoom: ChimeRoom | undefined = $roomList.rooms.find((room) => {
        return room.RoomId === enteredRoomId;
      });

      if (enteredRoom && openHideableRooms.has(enteredRoomId)) {
        openHideableRooms.set(enteredRoomId, {
          joinedAt: new Date(),
          name: enteredRoom.Name,
        });
      }
    });

    setInterval(
      () => {
        $logger.debug("Starting auto-hide.");
        if (!$settings.autoHideEnabled) {
          $logger.debug("Auto-hide disabled");
          return;
        }

        const visibleRoomsContainerElement = document.querySelector(
          "#app > div.LayoutRoute > div > nav > div.Sidebar__discussions > div.RoomList > div.SortableList"
        );

        if (!visibleRoomsContainerElement) {
          $logger.warn("Can't find Chime rooms list, stopping auto-hide");
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
            $logger.warn(
              "Can't find channel link in room element, stopping auto-hide",
              roomElement
            );
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
        let currentUrl = window.location.href;

        if (currentUrl.endsWith("#/")) {
          currentUrl = currentUrl.slice(0, -2);
        }

        const currentRoomId = currentUrl
          .slice(currentUrl.lastIndexOf("/") + 1)
          .replaceAll("/", "");

        const currentRoom: ChimeRoom | undefined = $roomList.rooms.find(
          (room) => {
            return room.RoomId === currentRoomId;
          }
        );

        if (currentRoom && openHideableRooms.has(currentRoomId)) {
          openHideableRooms.set(currentRoomId, {
            joinedAt: now,
            name: currentRoom.Name,
          });
        }

        autoHideRoomIds.forEach((roomId) => {
          let stored: { joinedAt: Date; name: string } | undefined =
            openHideableRooms.get(roomId);

          const roomInfo: ChimeRoom | undefined = $roomList.rooms.find(
            (room) => {
              return room.RoomId === roomId;
            }
          );

          if (!stored) {
            stored = { joinedAt: now, name: roomInfo ? roomInfo.Name : roomId };
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
              displayMessage: `Auto-hide ${roomInfo ? roomInfo.Name : roomId}`,
              status: "QUEUED",
              retries: 5,
            };

            // if ($settings.enabled) {
            if (
              !$runningQueue.items.find((item) => {
                return item.displayMessage === action.displayMessage;
              })
            ) {
              $logger.debug("Adding auto-hide room to running queue", action);
              $runningQueue.enqueue(action);
            } else {
              $logger.debug("Auto-hide room already in queue", action);
            }
            // } else {
            // $plannedQueue.enqueue(action);
            // }
          }
        });

        $runningQueue = $runningQueue;
        // $plannedQueue = $plannedQueue;

        openHideableRooms.forEach((_, storedId) => {
          if (!autoHideRoomIds.has(storedId)) {
            openHideableRooms.delete(storedId);
          }
        });

        $logger.debug("Auto-hide complete");
      },
      1 * 60 * 1000
    );
  }

  fetchChimeRooms();
  fetchChimeContacts();
  autoHideRooms();

  let appOpen = false;

  function toggleApp() {
    if (appOpen) {
      $logger.debug("Hiding Gotham window");
    } else {
      $logger.debug("Showing Gotham window");
    }
    appOpen = !appOpen;
    push("/");
  }

  function routeLoading(event: RouteLoadingEvent) {
    const location = event.detail.location;
    $logger.debug(`Navigating to ${location}`);
    $currentLocation = location;
  }
</script>

<div id={rootId}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="gotham-button" on:click={toggleApp}>
    <GothamIcon --color={"gray"} />
  </div>
  <!-- --stroke-hover={"gray"} -->
  <!-- --color-hover={"rgba(255, 255, 255, 1)"} -->
  <!-- --shadow-color-hover={"rgba(145, 92, 182, 0.4)"} -->

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="modal"
    class:show-modal={appOpen}
    on:click={() => {
      $logger.debug("Hiding Gotham window");
      appOpen = false;
    }}
  >
    <div class="modal-content" on:click|stopPropagation={() => {}}>
      <NavBar />
      <Router {routes} on:routeLoading={routeLoading} />
    </div>
  </div>
</div>

<style>
  .gotham-button {
    display: flex;
    cursor: pointer;
    margin-left: 10px;
    margin-right: -10px;
    border-radius: 4px;
    width: 60px;
    height: 30px;
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
