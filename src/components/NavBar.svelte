<script lange="ts">
  import { link } from "svelte-spa-router";
  import pkg from "../../package.json";
  import HomeIcon from "../icons/HomeIcon.svelte";
  import AddIcon from "../icons/AddIcon.svelte";
  import SettingsIcon from "../icons/SettingsIcon.svelte";
  import HelpIcon from "../icons/HelpIcon.svelte";
  import { currentLocation } from "../stores";

  const iconWidth = "40px";
  const iconHeight = "40px";
  const iconColorNormal = "gray";
  const iconColorSelected = "#ff6e42";
  const iconColorHover = "#ffad94";
  const iconVAlign = "text-top";
</script>

<nav>
  <span>{`version: ${pkg.version}`}</span>
  <div class="links">
    <h1>Gotham</h1>
    <a href="/" use:link
      ><HomeIcon
        --color={$currentLocation === "/" ? iconColorSelected : iconColorNormal}
        --color-hover={$currentLocation === "/"
          ? iconColorSelected
          : iconColorHover}
        --width={iconWidth}
        --height={iconHeight}
        --vertical-align={iconVAlign}
      /></a
    >

    <a href="/addjob" use:link
      ><AddIcon
        --color={$currentLocation === "/addjob"
          ? iconColorSelected
          : iconColorNormal}
        --color-hover={$currentLocation === "/addjob"
          ? iconColorSelected
          : iconColorHover}
        --width={iconWidth}
        --height={iconHeight}
        --vertical-align={iconVAlign}
      /></a
    >
    <a href="/settings" use:link
      ><SettingsIcon
        --color={$currentLocation === "/settings"
          ? iconColorSelected
          : iconColorNormal}
        --color-hover={$currentLocation === "/settings"
          ? iconColorSelected
          : iconColorHover}
        --width={iconWidth}
        --height={iconHeight}
        --vertical-align={iconVAlign}
      /></a
    >
    <a href="/help" use:link
      ><HelpIcon
        --color={$currentLocation === "/help"
          ? iconColorSelected
          : iconColorNormal}
        --color-hover={$currentLocation === "/help"
          ? iconColorSelected
          : iconColorHover}
        --width={iconWidth}
        --height={iconHeight}
        --vertical-align={iconVAlign}
      /></a
    >
  </div>
</nav>

<style>
  h1 {
    color: #ffffff;
    font-size: 36px;
    padding-right: 15px;
    float: left;
  }

  nav {
    width: 100%;
  }

  span {
    color: gray;
    position: absolute;
    right: 1.5rem;
  }

  .links {
    margin-left: auto;
  }

  a {
    padding-right: 5px;
  }
</style>
