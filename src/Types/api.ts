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
