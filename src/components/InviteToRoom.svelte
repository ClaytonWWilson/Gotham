<script lang="ts">
  import { link } from "svelte-spa-router";
  import { DEFAULT_FILTERS } from "../lib/defaults";
  import { STATION_NAME_REGEX } from "../lib/utilites";
  import { contactList, roomList, plannedQueue } from "../stores";
  import type { APIRequestInfo, HTTPRequest } from "../types/api";
  import type { FilterRule, JobChecklistItem } from "../types/ui";
  import SearchableChecklist from "./SearchableChecklist.svelte";
  import { processSimpleAPIRequest } from "../lib/transformers";

  let roomsChecklist: JobChecklistItem[] = [];

  roomList.subscribe((rooms) => {
    roomsChecklist = rooms.rooms.map((room) => {
      return {
        name: room.Name,
        id: room.RoomId,
        checked: false,
      };
    });
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

  function queueInvites() {
    const checkedContacts = contactsChecklist.filter(
      (contact) => contact.checked
    );
    const checkedRooms = roomsChecklist.filter((room) => room.checked);
    for (let i = 0; i < checkedContacts.length; i++) {
      for (let j = 0; j < checkedRooms.length; j++) {
        let contact = checkedContacts[i];
        let room = checkedRooms[j];
        let httpRequest: HTTPRequest = {
          endpoint: `https://api.express.ue1.app.chime.aws/msg/rooms/${room.id}/memberships/`,
          method: "POST",
          payload: {
            RoomId: room.id,
            ProfileId: contact.id,
          },
        };

        let apiRequest: APIRequestInfo = {
          request: httpRequest,
          action: "INVITE",
          createdAt: new Date(),
          displayMessage: `Invite ${contact.name} to ${room.name}`,
          status: "QUEUED",
          retries: 5,
        };

        $plannedQueue.enqueue({
          data: apiRequest,
          transformer: processSimpleAPIRequest,
        });
      }
    }
  }

  let selectedRoomsCount = 0;
  let selectedContactsCount = 0;
  const roomFilterRules: FilterRule[] = [
    ...DEFAULT_FILTERS,
    { name: "Stations", matcher: STATION_NAME_REGEX },
  ];
</script>

<div class="invite-container">
  <div class="lists-wrapper">
    <div class="checklist-container">
      <SearchableChecklist
        itemString="Rooms"
        filterRules={roomFilterRules}
        bind:checklistItems={roomsChecklist}
        loading={$roomList.loading}
        on:select={(event) =>
          (selectedRoomsCount = event.detail.selected.length)}
      />
    </div>
    <div class="checklist-container">
      <SearchableChecklist
        itemString="Contacts"
        bind:checklistItems={contactsChecklist}
        loading={$contactList.loading}
        on:select={(event) =>
          (selectedContactsCount = event.detail.selected.length)}
      />
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
