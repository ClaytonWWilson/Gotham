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

  function deleteHandler(e: { detail: { index: number } }) {
    $currentQueue.removeAt(e.detail.index);
    $currentQueue = $currentQueue;
  }
</script>

<div class="container">
  <QueueTabs
    on:tabclick={(e) => (selectedTab = e.detail.selected)}
    bind:selected={selectedTab}
  />
  <QueueList queue={$currentQueue} on:delete={deleteHandler} />
  <div style="padding-top: 10px;">
    <button
      on:click={() => {
        $currentQueue.drain();
        $currentQueue = $currentQueue;
      }}>Clear Queue</button
    >
    {#if selectedTab === "Planned"}
      <button on:click={runPlanned}>Start Queue</button>
    {/if}
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-rows: 30px auto 30px;
    width: 100%;
    max-height: 100%;
    min-height: 100%;
  }
</style>
