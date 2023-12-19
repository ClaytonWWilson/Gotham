import { roomList, contactList } from "../stores";
import { sendApiRequest, sleepms } from "./utilites";
import type {
  HTTPRequest,
  ChimeContactApiResponse,
  ChimeRoomsAPIResponse,
} from "../types/api";

const CHIME_ROOMS_BASE_URL = "https://api.express.ue1.app.chime.aws/msg/rooms/";

export async function fetchChimeRooms() {
  roomList.set({ loading: true, rooms: [] });

  let next: string | null = "";
  while (next !== null && next !== undefined) {
    const url = `${CHIME_ROOMS_BASE_URL}?next-token=${encodeURIComponent(
      next
    )}`;
    const request: HTTPRequest = {
      endpoint: url,
      method: "GET",
    };

    try {
      const response = await sendApiRequest(request);
      const responseJson: ChimeRoomsAPIResponse = JSON.parse(
        response.responseText
      );
      roomList.update((prev) => {
        prev.rooms.push(...responseJson.Rooms);
        return prev;
      });

      await sleepms(1000);
      next = responseJson.NextToken;
    } catch (error) {
      console.error(error);
      break;
    }
  }

  roomList.update((prev) => {
    prev.loading = false;
    prev.updatedAt = new Date();
    return prev;
  });
}

export async function fetchChimeContacts() {
  contactList.set({ loading: true, contacts: [] });
  try {
    const request: HTTPRequest = {
      endpoint: "https://api.express.ue1.app.chime.aws/bazl/contacts",
      method: "GET",
    };

    const response = await sendApiRequest(request);
    const responseJson: ChimeContactApiResponse = JSON.parse(
      response.responseText
    );

    contactList.update((prev) => {
      prev.contacts.push(...responseJson);
      return prev;
    });
  } catch (error) {
    console.error(error);
  }

  contactList.update((prev) => {
    prev.loading = false;
    prev.updatedAt = new Date();
    return prev;
  });
}
