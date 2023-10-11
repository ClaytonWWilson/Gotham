export type APIRequest = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  retries?: number;
  payload?: {};
  options?: {};
};
