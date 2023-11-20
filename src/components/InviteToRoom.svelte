<script lang="ts">
  import { link } from "svelte-spa-router";
  import { contactList, roomList, plannedQueue } from "../stores";
  import type { APIAction, APIRequest } from "../types/api";

  const STATION_NAME_REGEX =
    /^\s?((AMXL)?.?[A-Z]{3}[1-9]{1}.?.?(-|–).?.Central[\s]?Ops.?(-|–).?[A-Za-z]+)|DON3 - East - Central Ops$/g;
  type RoomsChecklistItem = {
    name: string;
    id: string;
    checked: boolean;
  };

  let roomsChecklist: RoomsChecklistItem[] = [];

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

  type ContactsChecklistItem = {
    name: string;
    id: string;
    checked: boolean;
  };

  let contactsChecklist: ContactsChecklistItem[] = [];

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

  function roomSelectHandler(roomItem: RoomsChecklistItem) {
    roomItem.checked = !roomItem.checked;

    if (roomItem.checked) {
      selectedRoomsCount++;
    } else {
      selectedRoomsCount--;
    }
    roomsChecklist = roomsChecklist;
  }

  function contactSelectHandler(contactItem: ContactsChecklistItem) {
    contactItem.checked = !contactItem.checked;

    if (contactItem.checked) {
      selectedContactsCount++;
    } else {
      selectedContactsCount--;
    }
    contactsChecklist = contactsChecklist;
  }

  function selectAll(list: RoomsChecklistItem[] | ContactsChecklistItem[]) {
    for (let i = 0; i < list.length; i++) {
      list[i].checked = true;
    }
  }

  function selectNone(list: RoomsChecklistItem[] | ContactsChecklistItem[]) {
    for (let i = 0; i < list.length; i++) {
      list[i].checked = false;
    }
  }

  function selectRegex(
    list: RoomsChecklistItem[] | ContactsChecklistItem[],
    regex: RegExp
  ) {
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
          retries: 5,
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
        };

        $plannedQueue.enqueue(action);
      }
    }
  }

  let selectedRoomsCount = 0;
  let selectedContactsCount = 0;
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
  <h3>Contacts: {contactsChecklist.length}</h3>
  <div>
    <span style="font-size: 8pt; color: gray; border: 1px solid gold;"
      >selected: {selectedContactsCount}</span
    >
    <div style="float:right;">
      <button
        on:click={() => {
          selectAll(contactsChecklist);
          selectedContactsCount = contactsChecklist.length;
          contactsChecklist = contactsChecklist;
        }}>All</button
      >
      <button
        on:click={() => {
          selectNone(contactsChecklist);
          selectedContactsCount = 0;
          contactsChecklist = contactsChecklist;
        }}>None</button
      >
    </div>
  </div>
  <div class="contact-list">
    <ul
      style="list-style-type: none; padding-left: 0; margin-top: 0; margin-bottom: 0;"
    >
      {#each contactsChecklist as contact}
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li
          on:click={() => contactSelectHandler(contact)}
          on:keydown={() => {}}
        >
          <div style="display: flex; border-bottom: 1px solid gray;">
            <input
              type="checkbox"
              value="testvalue"
              checked={contact.checked}
            />
            <span style="user-select: none;">{contact.name}</span>
          </div>
        </li>
      {/each}
    </ul>
  </div>
  <span
    >Inviting {selectedContactsCount} people to {selectedRoomsCount} rooms: {selectedContactsCount *
      selectedRoomsCount} invites</span
  >
  <a class="invite-link" href="/" use:link>
    <button on:click={queueInvites}>Queue Invites</button>
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

  .invite-link {
    margin-top: auto;
    display: block;
  }

  .invite-link > button {
    width: 100%;
  }

  .station-list {
    /* border: 2px solid red; */
    height: 130px;
    overflow-y: scroll;
  }

  .contact-list {
    /* border: 2px solid red; */
    height: 130px;
    overflow-y: scroll;
  }

  ul {
    cursor: pointer;
  }
</style>
