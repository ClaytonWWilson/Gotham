<script lang="ts">
  import { link } from "svelte-spa-router";
  import { roomList, plannedQueue } from "../stores";
  import type { APIAction, APIRequest } from "../types/api";
  import { STATION_NAME_REGEX } from "../lib/utilites";
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
        retries: 5,
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
      };
      $plannedQueue.enqueue(action);
    }
  }

  let selectedRoomsCount = 0;
</script>

<div class="invite-container">
  <h3>Rooms: {roomsChecklist.length}</h3>
  <div>
    <span style="font-size: 8pt; color: gray; border: 1px solid gold;"
      >selected: {selectedRoomsCount}</span
    >
    <div style="float:right;">
      <button
        on:click={() => {
          selectAll(roomsChecklist);
          selectedRoomsCount = roomsChecklist.length;
          roomsChecklist = roomsChecklist;
        }}>All</button
      >
      <button
        on:click={() => {
          selectNone(roomsChecklist);
          selectedRoomsCount = 0;
          roomsChecklist = roomsChecklist;
        }}>None</button
      >
      <button
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
  <div class="station-list">
    {#if $roomList.loading}
      Loaded {$roomList.rooms.length} rooms...
    {:else}
      <ul
        style="list-style-type: none; padding-left: 0; margin-top: 0; margin-bottom: 0;"
      >
        {#each roomsChecklist as room}
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <li on:click={() => roomSelectHandler(room)} on:keydown={() => {}}>
            <div style="display: flex; border-bottom: 1px solid gray;">
              <input type="checkbox" value="testvalue" checked={room.checked} />
              <span style="user-select: none;">{room.name}</span>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  <span>Hiding {selectedRoomsCount} rooms</span>
  <a class="hiding-link" href="/" use:link>
    <button on:click={queueHidingOperations}>Queue Hiding</button>
  </a>
</div>

<style>
  h3 {
    margin-top: 0px;
    margin-bottom: 0px;
    /* text-align: center; */
  }

  .invite-container {
    color: white;
    display: flex;
    flex-direction: column;
    /* border: 2px solid orange; */
    flex-grow: 1;
  }

  .hiding-link {
    margin-top: auto;
    display: block;
  }

  .hiding-link > button {
    width: 100%;
  }

  .station-list {
    /* border: 2px solid red; */
    height: 260px;
    overflow-y: scroll;
  }

  ul {
    cursor: pointer;
  }
</style>