<script>
  import InviteToRoom from "../components/InviteToRoom.svelte";
  let selected = "Invite to rooms";
</script>

<div class="select-container">
  <select bind:value={selected}>
    <option>Invite to rooms</option>
    <option>Remove from rooms</option>
    <option>Hide chime rooms</option>
  </select>
</div>

{#if selected === "Invite to rooms"}
  <InviteToRoom />
{:else if selected === "Remove from rooms"}
  <p>Show UI to remove person from rooms</p>
{:else if selected === "Hide chime rooms"}
  <p>Show UI to hide rooms</p>
{/if}

<style>
  .select-container {
    display: flex;
    height: 30px;
  }

  select {
    margin-left: auto;
    margin-right: auto;
    margin-top: 0px;
    margin-bottom: 0px;
    height: 30px;
    text-align: center;
    font-size: 12pt;
    color: white;
  }

  option {
    font-size: 12pt;
  }
</style>
