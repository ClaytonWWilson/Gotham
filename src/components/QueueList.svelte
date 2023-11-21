<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type AwaitedQueueProcessor from "../lib/AwaitedQueueProcessor";
  import type { APIAction, APIActionError } from "../types/api";
  import { trimString } from "../lib/utilites";

  export let queue: AwaitedQueueProcessor<
    APIAction | APIActionError,
    Tampermonkey.Response<object> | void
  >;

  const dispatch = createEventDispatcher();

  function deleteHandler(index: number) {
    dispatch("delete", { index });
  }
</script>

<section>
  {#each queue.items as item, index}
    <div>
      <span class="item-message">{trimString(item.displayMessage, 33)}</span>
      <span
        class="item-delete"
        on:click={() => {
          deleteHandler(index);
        }}
        on:keydown={() => {}}>Delete</span
      >
    </div>
  {/each}
</section>

<style>
  section {
    overflow-y: scroll;
    overflow-x: hidden;
    height: 100%;
  }

  div {
    display: grid;
    width: 100%;
    column-gap: 5px;
    /* grid-template-columns: 10% 35% 5% 45%; */
    grid-template-columns: 80% 20%;
    border: 1px solid black;
    height: 30px;
  }

  .item-message {
    color: #fff;
  }

  .item-delete {
    color: red;
    cursor: pointer;
    text-decoration: underline;
    user-select: none;
  }
</style>
