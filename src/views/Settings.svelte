<script lang="ts">
  import { STATION_NAME_REGEX } from "../lib/utilites";
  import { roomList, settings } from "../stores";
  import type { JobChecklistItem } from "../types/ui";

  let autoHideRoomsListVisible = false;
  let selectedRoomsCount = 0;
  let roomsChecklist: JobChecklistItem[] = [];

  roomList.subscribe((rooms) => {
    if (!rooms.loading) {
      roomsChecklist = rooms.rooms.map((room) => {
        return {
          name: room.Name,
          id: room.RoomId,
          checked: $settings.autoHideRooms.has(room.RoomId),
        };
      });
    }
  });

  function selectAll(list: JobChecklistItem[]) {
    for (let i = 0; i < list.length; i++) {
      list[i].checked = true;
      $settings.autoHideRooms.add(list[i].id);
    }
    $settings = $settings;
  }

  function selectNone(list: JobChecklistItem[]) {
    for (let i = 0; i < list.length; i++) {
      list[i].checked = false;
      $settings.autoHideRooms.clear();
    }
    $settings = $settings;
  }

  function selectRegex(list: JobChecklistItem[], regex: RegExp) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].name.match(regex)) {
        list[i].checked = true;
        $settings.autoHideRooms.add(list[i].id);
      }
    }
    $settings = $settings;
  }

  function roomSelectHandler(roomItem: JobChecklistItem) {
    roomItem.checked = !roomItem.checked;

    if (roomItem.checked) {
      selectedRoomsCount++;
      $settings.autoHideRooms.add(roomItem.id);
    } else {
      selectedRoomsCount--;
      $settings.autoHideRooms.delete(roomItem.id);
    }
    roomsChecklist = roomsChecklist;

    $settings = $settings;
  }

  $: filteredRoomCheckList = roomsChecklist.filter((room) => {
    if (!roomSearch) return true;

    return room.name.toLowerCase().match(roomSearch.toLowerCase());
  });

  let roomSearch: string | undefined;

  function waitTimeChangeHandler(e: Event) {
    const selectEl = e.target as HTMLSelectElement;
    $settings.autoHideWaitSeconds = parseInt(selectEl.value) * 60;
  }
</script>

<div class="container">
  <div class="settings-row">
    <span>Seconds between requests: </span>
    <input
      class="request-wait"
      type="number"
      bind:value={$settings.requestWaitSeconds}
    />
  </div>
  <div class="settings-row">
    <input type="checkbox" bind:checked={$settings.autoHideEnabled} />
    <span
      on:click={() => {
        $settings.autoHideEnabled = !$settings.autoHideEnabled;
      }}
      on:keydown={() => {}}>Auto-hide rooms</span
    >
    <select
      value={String($settings.autoHideWaitSeconds / 60)}
      on:change={waitTimeChangeHandler}
    >
      <option value="5">5 min</option>
      <option value="10">10 min</option>
      <option value="15">15 min</option>
      <option value="20">20 min</option>
    </select>
    <button
      on:click={() => (autoHideRoomsListVisible = !autoHideRoomsListVisible)}
      >Configure</button
    >
  </div>
  <div class="auto-hide-rooms-container">
    {#if autoHideRoomsListVisible}
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
              <li
                on:click={() => roomSelectHandler(room)}
                on:keydown={() => {}}
              >
                <div class="list-item-wrapper">
                  <input type="checkbox" checked={room.checked} />
                  <span style="text-wrap: nowrap;">{room.name}</span>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  button {
    color: white;
    background-color: #6b6b6b;
  }

  h3 {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  select {
    color: #fff;
    background-color: #6b6b6b;
  }

  span {
    user-select: none;
  }

  ul {
    cursor: pointer;
    list-style-type: none;
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
    max-width: 400px;
    overflow-x: hidden;
  }

  .auto-hide-rooms-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .container {
    color: white;
  }

  .list-item-wrapper {
    display: flex;
    border-bottom: 1px solid gray;
  }

  .request-wait {
    width: 40px;
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

  .settings-row {
    display: flex;
    border-bottom: 1px solid gray;
    column-gap: 5px;
    padding-bottom: 5px;
    padding-top: 5px;
  }

  .station-list {
    height: 200px;
    overflow-y: scroll;
  }
</style>
