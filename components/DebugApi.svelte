<script>
  import { Modal } from "carbon-components-svelte";

  export let requestJson;
  export let responseJson;

  let openRequest = false;
  let openResponse = false;

  function toggleRequest() {
    openResponse = false;
    openRequest = !openRequest;
    console.log(`hey, ${openRequest}`);
  }
  function toggleResponse() {
    openRequest = false;
    openResponse = !openResponse;
  }
</script>

<Modal passiveModal modalHeading="Request JSON" bind:openRequest>
  <pre>{JSON.stringify(requestJson)}</pre>
</Modal>
<Modal passiveModal modalHeading="Response JSON" bind:openResponse>
  <pre>{JSON.stringify(responseJson)}</pre>
</Modal>
<button type="button" on:click={toggleRequest}>Debug API request</button>
<button type="button" on:click={toggleResponse}>Debug API response</button>

<!-- TODO The modals aren't working? -->
{#if openRequest}
  <pre>{JSON.stringify(requestJson)}</pre>
{/if}
{#if openResponse}
  <pre>{JSON.stringify(responseJson)}</pre>
{/if}
