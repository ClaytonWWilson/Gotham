<script lang="ts">
  import { fetchChimeContacts, fetchChimeRooms } from "../lib/fetchToState";
  import { relativeTime } from "../lib/utilites";
  import { logger } from "../loggerStore";
  import { roomList } from "../stores";

  console.log($roomList.updatedAt);

  async function getLogs() {
    return await $logger.export(1000);
  }

  async function copyLogsToClipboard() {
    const lines = await getLogs();
    const text = lines.join("\n");
    GM_setClipboard(text, {
      type: "text",
      mimetype: "text/plain",
    });
  }

  async function copyCompressedLogsToClipboard() {
    const text = await $logger.exportGzipped(1000);
    GM_setClipboard(text, {
      type: "text",
      mimetype: "text/plain",
    });
  }

  let logsPromise = getLogs();
</script>

<div class="container">
  <div class="settings-row">
    <button
      on:click={() => {
        fetchChimeRooms();
        fetchChimeContacts();
      }}>Refresh API Data</button
    >
    {#if $roomList.updatedAt}
      <span class="last-updated"
        >{`Last updated ${relativeTime(new Date(), $roomList.updatedAt)}`}</span
      >
    {:else}
      <span class="last-updated">Updating...</span>
    {/if}
  </div>
  <div class="settings-row">
    <button on:click={async () => copyLogsToClipboard()}
      >Copy recent logs</button
    >
  </div>
  <div class="settings-row">
    <button on:click={async () => copyCompressedLogsToClipboard()}
      >Copy recent logs (compressed)</button
    >
  </div>
  <div class="settings-row">
    <div class="logs-display">
      {#await logsPromise then logs}
        {#each logs as log}
          <span class="log-line">{log}</span>
        {/each}
      {/await}
    </div>
  </div>
  <div class="settings-row">
    <button on:click={() => (logsPromise = getLogs())}>Refresh Logs</button>
  </div>
  <div class="settings-row footer">
    <span
      >Found a bug? Report it <a
        href="https://github.com/ClaytonWWilson/scripts/issues"
        target="_blank">here</a
      ></span
    >
  </div>
</div>

<style>
  button {
    color: white;
    background-color: #6b6b6b;
  }

  .last-updated {
    color: gray;
  }

  .logs-display {
    display: flex;
    flex-direction: column;
    border: inset 2px black;
    height: 300px;
    width: 100%;
    overflow-y: scroll;
  }

  .log-line {
    color: white;
    text-wrap: nowrap;
  }

  .container {
    display: flex;
    flex-direction: column;
    color: white;
    width: 100%;
  }

  .settings-row {
    display: flex;
    border-bottom: 1px solid gray;
    column-gap: 5px;
    padding-bottom: 5px;
    padding-top: 5px;
    max-width: 47rem;
  }

  .footer {
    margin-top: auto;
  }
</style>
