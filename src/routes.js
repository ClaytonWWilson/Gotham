import Home from "./views/Home.svelte";
import Settings from "./views/Settings.svelte";
import NotFound from "./views/NotFound.svelte";
import AddJob from "./views/AddJob.svelte";

export const routes = {
  "/": Home,
  "/settings": Settings,
  "/addjob": AddJob,
  "*": NotFound,
};
