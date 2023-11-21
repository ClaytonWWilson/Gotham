<script lang="ts">
  import QueueTabs from "../components/QueueTabs.svelte";
  import QueueList from "../components/QueueList.svelte";
  import {
    failedQueue,
    finishedQueue,
    plannedQueue,
    runningQueue,
  } from "../stores";
  import type { APIAction, APIActionError } from "../types/api";
  import type { Writable } from "svelte/store";
  import type AwaitedQueueProcessor from "../lib/AwaitedQueueProcessor";
  let selectedTab = "Planned";

  let currentQueue: Writable<
    AwaitedQueueProcessor<
      APIAction | APIActionError,
      Tampermonkey.Response<object> | void
    >
  >;

  $: switch (selectedTab) {
    case "Planned":
      currentQueue = plannedQueue;
      break;
    case "Running":
      currentQueue = runningQueue;
      break;
    case "Finished":
      currentQueue = finishedQueue;
      break;
    case "Failed":
      currentQueue = failedQueue;
      break;
  }

  function runPlanned() {
    $runningQueue.enqueue(...$plannedQueue.drain());
    $plannedQueue = $plannedQueue;
    $runningQueue.run();
    $runningQueue = $runningQueue;
  }

  function deleteHandler(e) {
    $currentQueue.removeAt(e.detail.index);
    $currentQueue = $currentQueue;
  }
</script>

<div class="container">
  <div class="content">
    <QueueTabs
      on:tabclick={(e) => (selectedTab = e.detail.selected)}
      bind:selected={selectedTab}
    />
    <QueueList queue={$currentQueue} on:delete={deleteHandler} />
    <div>
      <button
        on:click={() => {
          $currentQueue.drain();
          $currentQueue = $currentQueue;
        }}>Clear Queue</button
      >
      <button on:click={runPlanned}>Start Queue</button>
    </div>
  </div>
</div>

<style>
  .content {
    height: 320px;
  }
</style>
