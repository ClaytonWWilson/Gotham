export interface AppSettings {
  autoHideEnabled: boolean;
  autoHideRooms: Set<string>;
  autoHideWaitSeconds: number;
  requestWaitSeconds: number;
}

export interface Transformable<V, W> {
  data: V;
  transformer: (queueItem: V) => Promise<W>;
}
