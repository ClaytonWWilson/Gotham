<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { truncateString } from "../lib/utilites";
  import type AwaitedQueueProcessor from "../lib/AwaitedQueueProcessor";
  import type { APIAction } from "../types/api";

  export let queue: AwaitedQueueProcessor<
    APIAction,
    Tampermonkey.Response<object> | void
  >;

  const dispatch = createEventDispatcher();

  function deleteHandler(index: number) {
    dispatch("delete", { index });
  }
</script>

<section>
  <table>
    {#each queue.items as item, index}
      <tr class="item">
        <td class="item-message">{truncateString(item.displayMessage, 80)}</td>
        {#if item.error}
          <td class="item-error">{truncateString(item.error, 30)}</td>
        {/if}
        <td
          class="item-delete"
          on:click={() => {
            deleteHandler(index);
          }}
          on:keydown={() => {}}>Delete</td
        >
      </tr>
    {/each}
  </table>
</section>

<style>
  section {
    overflow-y: scroll;
    overflow-x: hidden;
  }

  table {
    width: 100%;
  }

  .item-error {
    color: palevioletred;
    width: 25%;
  }

  .item-delete {
    color: red;
    cursor: pointer;
    text-decoration: underline;
    user-select: none;
  }

  .item-message {
    color: #fff;
    width: 100%;
  }

  .item {
    padding-left: 10px;
    padding-right: 10px;
    border: 1px solid black;
    padding-top: 2px;
    padding-bottom: 2px;
  }
</style>
