<script lang="ts">
  import SearchableInputList from "../components/SearchableInputList.svelte";
  import { DEFAULT_FILTERS } from "../lib/defaults";
  import { STATION_NAME_REGEX } from "../lib/utilites";
  import { roomList, settings } from "../stores";
  import type { FilterRule, SearchableListItem } from "../types/ui";

  let autoHideRoomsListVisible = false;
  let roomsChecklist: SearchableListItem[] = [];

  let selectedAutoHideRooms: SearchableListItem | SearchableListItem[] = [];

  roomList.subscribe((rooms) => {
    roomsChecklist = rooms.rooms.map((room) => {
      return {
        name: room.Name,
        id: room.RoomId,
        checked: $settings.autoHideRooms.has(room.RoomId),
      };
    });

    selectedAutoHideRooms = roomsChecklist.filter((room) => room.checked);
  });

  function roomSelectHandler(roomItems: SearchableListItem[]) {
    $settings.autoHideRooms.clear();
    roomItems.forEach((room) => $settings.autoHideRooms.add(room.id));
    roomsChecklist = roomsChecklist;

    $settings = $settings;
  }

  function waitTimeChangeHandler(e: Event) {
    const selectEl = e.target as HTMLSelectElement;
    $settings.autoHideWaitSeconds = parseInt(selectEl.value) * 60;
  }

  const filterRules: FilterRule[] = [
    ...DEFAULT_FILTERS,
    { name: "Stations", matcher: STATION_NAME_REGEX },
  ];
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
      <div class="checklist-container">
        <SearchableInputList
          itemString="Rooms"
          {filterRules}
          loading={$roomList.loading}
          type="checkbox"
          checklistItems={roomsChecklist}
          bind:selected={selectedAutoHideRooms}
          on:select={(data) => {
            console.log(data.detail);
            const selectedRooms = data.detail.selected;
            roomSelectHandler(selectedRooms);
          }}
        />
      </div>
    {/if}
  </div>
</div>

<style>
  button {
    color: white;
    background-color: #6b6b6b;
  }

  select {
    color: #fff;
    background-color: #6b6b6b;
  }

  span {
    user-select: none;
  }

  .auto-hide-rooms-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .checklist-container {
    display: grid;
    grid-template-rows: 200px;
  }

  .container {
    color: white;
  }

  .request-wait {
    width: 40px;
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
</style>
