<script lang="ts">
  import QueueTabs from "../components/QueueTabs.svelte";
  import QueueList from "../components/QueueList.svelte";
  import { plannedQueue } from "../stores";
  let selectedTab = "Queue";
</script>

<div class="container">
  <div class="content">
    <QueueTabs
      on:tabclick={(e) => (selectedTab = e.detail.selected)}
      bind:selected={selectedTab}
    />
    <QueueList queue={$plannedQueue} />
  </div>
</div>

<style>
  .content {
    height: 320px;
  }
</style>
