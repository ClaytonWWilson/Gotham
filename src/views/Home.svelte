<script lang="ts">
  import QueueTabs from "../components/QueueTabs.svelte";
  import QueueList from "../components/QueueList.svelte";
  let selectedTab = "Queue";
</script>

<div class="container">
  <div class="content">
    <QueueTabs
      on:tabclick={(e) => (selectedTab = e.detail.selected)}
      bind:selected={selectedTab}
    />
    <QueueList />
  </div>
</div>

<style>
  /* #container {
    display: inline-block;
    background: #ffffff;
    color: #643045;
    font-weight: bold;
    padding: 5px 10px;
    font-size: 13px;
    border-radius: 4px;
  } */

  /* #content {
    border: 1px solid red;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
    width: 300px;
    flex-direction: column;
    background-color: wheat;
  } */
</style>
