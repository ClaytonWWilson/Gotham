<script lang="ts">
  import SearchableInputList from "./SearchableInputList.svelte";

  import { link } from "svelte-spa-router";
  import { STATION_NAME_REGEX } from "../lib/utilites";
  import { roomList, plannedQueue } from "../stores";
  import type { APIAction, APIRequest } from "../types/api";
  import type { FilterRule, SearchableListItem } from "../types/ui";
  import { DEFAULT_FILTERS } from "../lib/defaults";

  let roomsChecklist: SearchableListItem[] = [];

  roomList.subscribe((rooms) => {
    roomsChecklist = rooms.rooms
      .filter((room) => room.Visibility === "visible")
      .map((room) => {
        return {
          name: room.Name,
          id: room.RoomId,
          checked: false,
        };
      });
  });

  function queueHidingOperations() {
    const checkedRooms = roomsChecklist.filter((room) => room.checked);
    for (let i = 0; i < checkedRooms.length; i++) {
      let room = checkedRooms[i];
      let request: APIRequest = {
        endpoint: `https://api.express.ue1.app.chime.aws/msg/rooms/${room.id}`,
        method: "POST",
        payload: {
          RoomId: room.id,
          Visibility: "hidden",
        },
      };
      let action: APIAction = {
        request,
        action: "HIDE",
        createdAt: new Date(),
        displayMessage: `Hide room ${room.name}`,
        status: "QUEUED",
        retries: 5,
      };
      $plannedQueue.enqueue(action);
    }
  }

  let selectedRoomsCount = 0;
  const filterRules: FilterRule[] = [
    ...DEFAULT_FILTERS,
    { name: "Stations", matcher: STATION_NAME_REGEX },
  ];
</script>

<div class="hide-rooms-container">
  <SearchableInputList
    itemString="Visible Rooms"
    type="checkbox"
    bind:checklistItems={roomsChecklist}
    loading={$roomList.loading}
    {filterRules}
    on:select={(event) => {
      selectedRoomsCount = event.detail.selected.length;
    }}
  />
  <span>Hiding {selectedRoomsCount} rooms</span>
  <a class="hiding-link" href="/" use:link>
    <button class="queue-button" on:click={queueHidingOperations}
      >Queue Hiding</button
    >
  </a>
</div>

<style>
  button {
    color: white;
  }

  .hide-rooms-container {
    color: white;
    display: grid;
    width: 100%;
    grid-template-rows: auto 20px 20px;
    min-height: 100%;
  }

  .hiding-link {
    margin-top: auto;
    display: block;
  }

  .hiding-link > button {
    width: 100%;
  }

  .queue-button {
    color: white;
    background-color: #6b6b6b;
  }
</style>
