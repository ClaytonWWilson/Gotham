<script lang="ts">
  import { STATION_NAME_REGEX } from "../lib/utilites";
  import { roomList, settings } from "../stores";
  let autoHideInput: HTMLInputElement;
  let autoHideRoomsListVisible = false;
  import type { JobChecklistItem } from "../types/ui";

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
</script>

<div style="display: flex; border-bottom: 1px solid gray;">
  <input
    type="checkbox"
    checked={false}
    bind:this={autoHideInput}
    on:change={() => ($settings.autoHideEnabled = autoHideInput.checked)}
  />
  <span
    style="user-select: none;"
    on:click={() => {
      autoHideInput.checked = !autoHideInput.checked;
      $settings.autoHideEnabled = autoHideInput.checked;
    }}
    on:keydown={() => {}}>Auto-hide rooms</span
  >
  <select
    value={$settings.autoHidewaitMinutes.toString()}
    on:change={(e) =>
      ($settings.autoHidewaitMinutes = parseInt(e.target.value))}
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
                <input type="checkbox" checked={room.checked} />
                <span style="user-select: none;">{room.name}</span>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

<style>
  h3 {
    margin-top: 0px;
    margin-bottom: 0px;
    /* text-align: center; */
  }

  .station-list {
    /* border: 2px solid red; */
    height: 130px;
    overflow-y: scroll;
  }

  ul {
    cursor: pointer;
  }

  .auto-hide-rooms-container {
    color: white;
    display: flex;
    flex-direction: column;
    /* border: 2px solid orange; */
    flex-grow: 1;
  }

  select {
    color: #fff;
  }
</style>
