<script lang="ts">
  import { link } from "svelte-spa-router";
  import { STATION_NAME_REGEX } from "../lib/utilites";
  import { contactList, roomList, plannedQueue } from "../stores";
  import type { APIAction, APIRequest } from "../types/api";
  import type { JobChecklistItem } from "../types/ui";

  let roomsChecklist: JobChecklistItem[] = [];

  roomList.subscribe((rooms) => {
    if (!rooms.loading) {
      roomsChecklist = rooms.rooms.map((room) => {
        return {
          name: room.Name,
          id: room.RoomId,
          checked: false,
        };
      });
    }
  });

  let contactsChecklist: JobChecklistItem[] = [];

  contactList.subscribe((contacts) => {
    if (!contacts.loading) {
      contactsChecklist = contacts.contacts.map((contact) => {
        return {
          name: contact.display_name,
          id: contact.id,
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

  function contactSelectHandler(contactItem: JobChecklistItem) {
    contactItem.checked = !contactItem.checked;

    if (contactItem.checked) {
      selectedContactsCount++;
    } else {
      selectedContactsCount--;
    }
    contactsChecklist = contactsChecklist;
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

  function queueInvites() {
    const checkedContacts = contactsChecklist.filter(
      (contact) => contact.checked
    );
    const checkedRooms = roomsChecklist.filter((room) => room.checked);
    for (let i = 0; i < checkedContacts.length; i++) {
      for (let j = 0; j < checkedRooms.length; j++) {
        let contact = checkedContacts[i];
        let room = checkedRooms[j];
        let request: APIRequest = {
          endpoint: `https://api.express.ue1.app.chime.aws/msg/rooms/${room.id}/memberships/`,
          method: "POST",
          payload: {
            RoomId: room.id,
            ProfileId: contact.id,
          },
        };

        let action: APIAction = {
          request,
          action: "INVITE",
          createdAt: new Date(),
          displayMessage: `Invite ${contact.name} to ${room.name}`,
          status: "QUEUED",
          retries: 5,
        };

        $plannedQueue.enqueue(action);
      }
    }
  }

  $: filteredRoomCheckList = roomsChecklist.filter((room) => {
    if (!roomSearch) return true;

    return room.name.toLowerCase().match(roomSearch.toLowerCase());
  });

  $: filteredContactChecklist = contactsChecklist.filter((contact) => {
    if (!contactSearch) return true;

    return contact.name.toLowerCase().match(contactSearch.toLowerCase());
  });

  let selectedRoomsCount = 0;
  let selectedContactsCount = 0;
  let roomSearch: string | undefined;
  let contactSearch: string | undefined;
</script>

<div class="invite-container">
  <div class="lists-wrapper">
    <div class="checklist-container">
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
              selectRegex(roomsChecklist, STATION_NAME_REGEX);
              selectedRoomsCount = roomsChecklist.filter(
                (room) => room.checked
              ).length;
              roomsChecklist = roomsChecklist;
            }}>Stations</button
          >
          <button
            class="select-button"
            on:click={() => {
              selectNone(roomsChecklist);
              selectedRoomsCount = 0;
              roomsChecklist = roomsChecklist;
            }}>None</button
          >
        </div>
      </div>
      <input type="search" class="search-input" bind:value={roomSearch} />
      <div class="checkable-list">
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
    </div>
    <div class="checklist-container">
      <h3>Contacts: {contactsChecklist.length}</h3>
      <div>
        <span style="font-size: 8pt; color: gray;"
          >selected: {selectedContactsCount}</span
        >
        <div style="float:right;">
          <button
            class="select-button"
            on:click={() => {
              selectAll(contactsChecklist);
              selectedContactsCount = contactsChecklist.length;
              contactsChecklist = contactsChecklist;
            }}>All</button
          >
          <button
            class="select-button"
            on:click={() => {
              selectNone(contactsChecklist);
              selectedContactsCount = 0;
              contactsChecklist = contactsChecklist;
            }}>None</button
          >
        </div>
      </div>
      <input type="search" class="search-input" bind:value={contactSearch} />
      <div class="checkable-list">
        <ul>
          {#each filteredContactChecklist as contact}
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li
              on:click={() => contactSelectHandler(contact)}
              on:keydown={() => {}}
            >
              <div style="display: flex; border-bottom: 1px solid gray;">
                <input type="checkbox" checked={contact.checked} />
                <span style="user-select: none; text-wrap: nowrap;"
                  >{contact.name}</span
                >
              </div>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
  <span
    >Inviting {selectedContactsCount} people to {selectedRoomsCount} rooms: {selectedContactsCount *
      selectedRoomsCount} invites</span
  >
  <a class="invite-link" href="/" use:link>
    <button class="queue-button" on:click={queueInvites}>Queue Invites</button>
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

  .checkable-list {
    max-height: 100%;
    overflow-y: auto;
  }

  .checklist-container {
    width: 100%;
    min-height: 100%;
    display: grid;
    grid-template-rows: 20px 20px 20px auto;
  }

  .invite-container {
    color: white;
    min-height: 100%;
    display: grid;
    grid-template-rows: auto 20px 20px;
    width: 100%;
  }

  .invite-link > button {
    width: 100%;
  }

  .lists-wrapper {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 20px;
    min-height: 100%;
  }

  .queue-button {
    color: white;
    background-color: #6b6b6b;
  }

  .search-input {
    width: 100%;
    color: white;
    background-color: #6b6b6b;
  }

  .select-button {
    color: white;
    background-color: #6b6b6b;
  }
</style>
