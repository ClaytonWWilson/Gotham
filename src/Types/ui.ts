export type SearchableListItem = {
  name: string;
  [key: string]: any;
};

export type FilterRule = {
  name: string;
  matcher: RegExp;
};
