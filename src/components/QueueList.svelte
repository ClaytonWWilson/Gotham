<script lang="ts">
  import type AwaitedQueueProcessor from "../lib/AwaitedQueueProcessor";
  import type { APIAction } from "../types/api";

  export let queue: AwaitedQueueProcessor<
    APIAction,
    Tampermonkey.Response<object>
  >;
</script>

<section>
  {#each queue.items as item, index}
    <div>
      <span class="item-status">{item.status}</span>
      <span class="item-message">{item.displayMessage}</span>
      <span
        class="item-delete"
        on:click={() => {
          queue.removeAt(index);
          queue = queue;
        }}
        on:keydown={() => {}}>Delete</span
      >
      <span> {index}</span>
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
    grid-template-columns: 20% 60% 12% 8%;
    border: 1px solid black;
    height: 30px;
  }

  .item-status {
    color: blue;
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
