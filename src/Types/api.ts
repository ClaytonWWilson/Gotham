export interface APIRequest {
  method: "GET" | "POST" | "HEAD";
  endpoint: string;
  retries?: number;
  payload?: {};
}

export interface APIAction {
  request: APIRequest;
  action: "HIDE" | "INVITE";
  displayMessage: string;
  status: "CREATED" | "QUEUED" | "WAITING" | "RUNNING" | "COMPLETE";
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface ChimeRoom {
  ActiveRoomChannel: string;
  BackgroundRoomChannel: string;
  Channel: string;
  CreatedOn: string;
  CreatorId: string;
  CreatorIdentity: ChimeRoomCreatorIdentity;
  LastMentioned: string | null;
  LastRead: string;
  LastSent: string;
  Locked: null;
  MessageCount: number;
  Name: string;
  Open: boolean;
  Preferences: ChimeRoomPreferences;
  Privacy: string;
  RoomId: string;
  Type: string;
  UpdatedOn: string;
  Visibility: "hidden" | "visible";
  WorkTalkAccountId: string;
}

export interface ChimeRoomCreatorIdentity {
  DisplayName: string;
  Email: string;
  FullName: string;
  LastDelivered: string | null;
  LastRead: string | null;
  PresenceChannel: string;
  ProfileId: string;
  ProfileType: string;
  Username: string | null;
  WorkTalkAccountId: string;
}

export interface ChimeRoomPreferences {
  NotificationPreferences: ChimeRoomNotificationsPreferences;
}

export interface ChimeRoomNotificationsPreferences {
  DesktopNotificationPreferences: string;
  MobileNotificationPreferences: string;
}

export interface ChimeContact {
  id: string;
  email: string;
  display_name: string;
  full_name: string;
  presence_channel: string;
  profile_channel: string;
  personal_phone_number?: null;
  provisioned_phone_number?: null;
  license: string;
  work_talk_account_id: string;
  aws_account_id: string;
  protrial_ends_by?: null;
}

export interface ChimeRoomsAPIResponse {
  NextToken?: string;
  Rooms: ChimeRoom[];
}

export type ChimeContactApiResponse = ChimeContact[];

export interface AppChimeRooms {
  rooms: ChimeRoom[];
  loading: boolean;
}

export interface AppChimeContacts {
  contacts: ChimeContact[];
  loading: boolean;
}
