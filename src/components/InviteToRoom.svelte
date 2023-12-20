<script lang="ts">
  import { link } from "svelte-spa-router";
  import { DEFAULT_FILTERS } from "../lib/defaults";
  import { STATION_NAME_REGEX } from "../lib/utilites";
  import { contactList, roomList, plannedQueue } from "../stores";
  import type { APIAction, APIRequest } from "../types/api";
  import type { FilterRule, SearchableListItem } from "../types/ui";
  import SearchableInputList from "./SearchableInputList.svelte";

  let roomsChecklist: SearchableListItem[] = [];

  roomList.subscribe((rooms) => {
    roomsChecklist = rooms.rooms.map((room) => {
      return {
        name: room.Name,
        id: room.RoomId,
        checked: false,
      };
    });
  });

  let contactsChecklist: SearchableListItem[] = [];

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

  function queueInvites() {
    for (let i = 0; i < selectedContacts.length; i++) {
      for (let j = 0; j < selectedRooms.length; j++) {
        let contact = selectedContacts[i];
        let room = selectedRooms[j];
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

  const roomFilterRules: FilterRule[] = [
    ...DEFAULT_FILTERS,
    { name: "Stations", matcher: STATION_NAME_REGEX },
  ];
  let selectedRooms: SearchableListItem | SearchableListItem[] = [];
  let selectedContacts: SearchableListItem | SearchableListItem[] = [];
</script>

<div class="invite-container">
  <div class="lists-wrapper">
    <div class="checklist-container">
      <SearchableInputList
        itemString="Rooms"
        type="checkbox"
        filterRules={roomFilterRules}
        checklistItems={roomsChecklist}
        bind:selected={selectedRooms}
        loading={$roomList.loading}
      />
    </div>
    <div class="checklist-container">
      <SearchableInputList
        itemString="Contacts"
        type="checkbox"
        checklistItems={contactsChecklist}
        bind:selected={selectedContacts}
        loading={$contactList.loading}
      />
    </div>
  </div>
  <span
    >Inviting {selectedContacts.length} people to {selectedRooms.length} rooms: {selectedContacts.length *
      selectedRooms.length} invites</span
  >
  <a class="invite-link" href="/" use:link>
    <button class="queue-button" on:click={queueInvites}>Queue Invites</button>
  </a>
</div>

<style>
  button {
    color: white;
  }

  .checklist-container {
    width: 100%;
    min-height: 100%;
    display: grid;
    grid-template-rows: auto;
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
</style>
