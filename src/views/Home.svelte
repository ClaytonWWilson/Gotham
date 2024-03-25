<script lang="ts">
  import QueueTabs from "../components/QueueTabs.svelte";
  import QueueList from "../components/QueueList.svelte";
  import {
    failedQueue,
    finishedQueue,
    plannedQueue,
    runningQueue,
  } from "../stores";
  import type { Writable } from "svelte/store";
  import type AwaitedQueueProcessor from "../lib/AwaitedQueueProcessor";
  import type { APIAction } from "../types/api";

  let selectedTab = "Planned";

  let currentQueue: Writable<
    AwaitedQueueProcessor<APIAction, Tampermonkey.Response<object> | void>
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
    $runningQueue = $runningQueue;
  }

  function deleteHandler(e: { detail: { index: number } }) {
    $currentQueue.removeAt(e.detail.index);
    $currentQueue = $currentQueue;
  }

  async function stopRunning() {
    await $runningQueue.stop();
    $plannedQueue.enqueue(
      ...$runningQueue.drain().map((item) => {
        item.status = "QUEUED";
        return item;
      })
    );
    $plannedQueue = $plannedQueue;
    $runningQueue = $runningQueue;
  }

  function resumeRunning() {
    $runningQueue.runIndefinite();
    $runningQueue = $runningQueue;
  }

  function requeueFailed() {
    $plannedQueue.enqueue(
      ...$failedQueue.drain().map((item) => {
        delete item.error;
        item.status = "QUEUED";
        item.retries = 5;
        return item;
      })
    );
    $plannedQueue = $plannedQueue;
    $failedQueue = $failedQueue;
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

    {#if selectedTab === "Running"}
      {#if $runningQueue.isRunning()}
        <button on:click={stopRunning}>Stop</button>
      {:else}
        <button on:click={resumeRunning}>Resume</button>
      {/if}
    {/if}

    {#if selectedTab === "Failed"}
      <button on:click={requeueFailed}>Requeue Failed</button>
    {/if}

    <!-- <div class="on-off-switch">
      {#if $settings.enabled}
        <button
          class="enabled"
          on:click={() => ($settings.enabled = !$settings.enabled)}
          >Enabled</button
        >
      {:else}
        <button
          class="disabled"
          on:click={() => ($settings.enabled = !$settings.enabled)}
          >Disabled</button
        >
      {/if}
    </div> -->
  </div>
</div>

<style>
  button {
    color: white;
    background-color: #6b6b6b;
  }

  .container {
    display: grid;
    grid-template-rows: 30px auto 30px;
    width: 100%;
    max-height: 100%;
    min-height: 100%;
  }

  .on-off-switch {
    float: right;
    cursor: pointer;
  }

  .enabled {
    background-color: green;
    color: black;
  }

  .disabled {
    background-color: red;
    color: black;
  }
</style>
