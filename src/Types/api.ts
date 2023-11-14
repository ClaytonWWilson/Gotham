export interface APIRequest {
  method: "GET" | "POST" | "HEAD";
  endpoint: string;
  retries?: number;
  payload?: {};
}
