import type { AppSettings } from "../types/state";
import type { FilterRule } from "../types/ui";

export const DEFAULT_FILTERS: FilterRule[] = [
  {
    name: "All",
    matcher: /[\s\S]+/,
  },
  {
    name: "None",
    matcher: /(?!.*)/,
  },
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  autoHideEnabled: false,
  autoHideRooms: new Set(),
  autoHideWaitSeconds: 5 * 60,
  requestWaitSeconds: 1,
  enabled: true,
};
