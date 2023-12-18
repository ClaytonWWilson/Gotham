import type { FilterRule } from "../types/ui";

export const defaultFilters: FilterRule[] = [
  {
    name: "All",
    matcher: /[\s\S]+/,
  },
  {
    name: "None",
    matcher: /(?!.*)/,
  },
];
