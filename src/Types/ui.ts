export type JobChecklistItem = {
  name: string;
  id: string;
  checked: boolean;
};

export type FilterRule = {
  name: string;
  matcher: RegExp;
};
