<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { DEFAULT_FILTERS } from "../lib/defaults";
  import type { FilterRule, JobChecklistItem } from "../types/ui";

  const dispatch = createEventDispatcher();

  export let checklistItems: JobChecklistItem[] = [];
  export let title = "Items";
  export let loading = false;
  export let filterRules: FilterRule[] = DEFAULT_FILTERS;
  export let type: "checkbox" | "radio" = "checkbox";

  function dispatchSelectEvent() {
    dispatch("select", {
      selected: checklistItems.filter((item) => item.checked),
    });
  }

  function itemCheckHandler(item: JobChecklistItem) {
    if (item.checked) {
      selectedItemsCount--;
    } else {
      selectedItemsCount++;
    }

    item.checked = !item.checked;
    checklistItems = checklistItems;
    dispatchSelectEvent();
  }

  function selectRegex(list: JobChecklistItem[], regex: RegExp) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].name.match(regex)) {
        list[i].checked = true;
        selectedItemsCount++;
      } else {
        list[i].checked = false;
      }
    }

    dispatchSelectEvent();
  }

  $: filteredItemsCheckList = checklistItems.filter((item) => {
    if (!searchString) return true;

    return item.name.toLowerCase().match(searchString.toLowerCase());
  });

  $: selectedItemsCount = checklistItems.filter((item) => item.checked).length;
  let searchString: string | undefined;
</script>

<div class="container">
  <h3>{title}: {checklistItems.length}</h3>
  <div>
    <span class="title">selected: {selectedItemsCount}</span>
    <div class="filter-buttons-group">
      {#each filterRules as rule}
        <button
          class="select-button"
          on:click={() => {
            selectRegex(checklistItems, rule.matcher);
            checklistItems = checklistItems;
          }}>{rule.name}</button
        >
      {/each}
    </div>
  </div>
  <input type="search" class="search-input" bind:value={searchString} />
  <div class="ul-container">
    {#if loading}
      Loaded {checklistItems.length} {title}...
    {:else}
      <ul>
        {#each filteredItemsCheckList as item}
          <label>
            {#if type === "checkbox"}
              <input
                type="checkbox"
                checked={item.checked}
                value={item}
                on:change={() => {
                  itemCheckHandler(item);
                  dispatchSelectEvent();
                }}
              />
            {:else if type === "radio"}
              <input
                type="radio"
                value={item}
                on:change={() => {
                  itemCheckHandler(item);
                  dispatchSelectEvent();
                }}
              />
            {:else}
              <input
                value={item}
                on:change={() => {
                  itemCheckHandler(item);
                  dispatchSelectEvent();
                }}
              />
            {/if}
            {item.name}
          </label>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  button {
    color: white;
  }

  h3 {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  label {
    display: block;
    user-select: none;
    text-wrap: nowrap;
    border-bottom: 1px solid gray;
  }

  ul {
    cursor: pointer;
    list-style-type: none;
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
    overflow-x: hidden;
  }

  .container {
    color: white;
    display: grid;
    width: 100%;
    grid-template-rows: 20px 20px 20px auto;
    min-height: 100%;
  }

  .filter-buttons-group {
    float: right;
  }

  .search-input {
    color: white;
    background-color: #6b6b6b;
  }

  .select-button {
    color: white;
    background-color: #6b6b6b;
  }

  .title {
    font-size: 8pt;
    color: gray;
  }

  .ul-container {
    height: 100%;
    overflow-y: auto;
  }
</style>
