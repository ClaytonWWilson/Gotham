<script lang="ts">
  import { link } from "svelte-spa-router";
  import { STATION_NAME_REGEX } from "../lib/utilites";
  import { roomList, plannedQueue } from "../stores";
  import type { APIAction, APIRequest } from "../types/api";
  import type { JobChecklistItem } from "../types/ui";

  let roomsChecklist: JobChecklistItem[] = [];

  roomList.subscribe((rooms) => {
    if (!rooms.loading) {
      roomsChecklist = rooms.rooms
        .filter((room) => room.Visibility === "visible")
        .map((room) => {
          return {
            name: room.Name,
            id: room.RoomId,
            checked: false,
          };
        });
    }
  });

  function roomSelectHandler(roomItem: JobChecklistItem) {
    roomItem.checked = !roomItem.checked;

    if (roomItem.checked) {
      selectedRoomsCount++;
    } else {
      selectedRoomsCount--;
    }
    roomsChecklist = roomsChecklist;
  }

  function selectAll(list: JobChecklistItem[]) {
    for (let i = 0; i < list.length; i++) {
      list[i].checked = true;
    }
  }

  function selectNone(list: JobChecklistItem[]) {
    for (let i = 0; i < list.length; i++) {
      list[i].checked = false;
    }
  }

  function selectRegex(list: JobChecklistItem[], regex: RegExp) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].name.match(regex)) {
        list[i].checked = true;
      }
    }
  }

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

  $: filteredRoomCheckList = roomsChecklist.filter((room) => {
    if (!roomSearch) return true;

    return room.name.toLowerCase().match(roomSearch.toLowerCase());
  });

  let selectedRoomsCount = 0;
  let roomSearch: string | undefined;
</script>

<div class="hide-rooms-container">
  <h3>Rooms: {roomsChecklist.length}</h3>
  <div>
    <span style="font-size: 8pt; color: gray;"
      >selected: {selectedRoomsCount}</span
    >
    <div style="float:right;">
      <button
        class="select-button"
        on:click={() => {
          selectAll(roomsChecklist);
          selectedRoomsCount = roomsChecklist.length;
          roomsChecklist = roomsChecklist;
        }}>All</button
      >
      <button
        class="select-button"
        on:click={() => {
          selectNone(roomsChecklist);
          selectedRoomsCount = 0;
          roomsChecklist = roomsChecklist;
        }}>None</button
      >
      <button
        class="select-button"
        on:click={() => {
          selectRegex(roomsChecklist, STATION_NAME_REGEX);
          selectedRoomsCount = roomsChecklist.filter(
            (room) => room.checked
          ).length;
          roomsChecklist = roomsChecklist;
        }}>Stations</button
      >
    </div>
  </div>
  <input type="search" class="search-input" bind:value={roomSearch} />
  <div class="station-list">
    {#if $roomList.loading}
      Loaded {$roomList.rooms.length} rooms...
    {:else}
      <ul>
        {#each filteredRoomCheckList as room}
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <li on:click={() => roomSelectHandler(room)} on:keydown={() => {}}>
            <div style="display: flex; border-bottom: 1px solid gray;">
              <input type="checkbox" checked={room.checked} />
              <span style="user-select: none; text-wrap: nowrap;"
                >{room.name}</span
              >
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
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

  h3 {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  ul {
    cursor: pointer;
    list-style-type: none;
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
    overflow-x: hidden;
  }

  .hide-rooms-container {
    color: white;
    display: grid;
    width: 100%;
    grid-template-rows: 20px 20px 20px auto 20px 20px;
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

  .search-input {
    color: white;
    background-color: #6b6b6b;
  }

  .select-button {
    color: white;
    background-color: #6b6b6b;
  }

  .station-list {
    height: 100%;
    overflow-y: auto;
  }
</style>
