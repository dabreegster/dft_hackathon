<script>
  import { Modal, TextArea } from "carbon-components-svelte";

  export let requestJson;
  export let responseJson;

  let openRequest = false;
  let openResponse = false;

  function toggleRequest() {
    openResponse = false;
    openRequest = !openRequest;
  }
  function toggleResponse() {
    openRequest = false;
    openResponse = !openResponse;
  }
</script>

<Modal passiveModal modalHeading="Request JSON" bind:open={openRequest}>
  <TextArea
    readonly
    rows="20"
    value={JSON.stringify(requestJson, null, "  ")}
  />
</Modal>
<Modal passiveModal modalHeading="Response JSON" bind:open={openResponse}>
  <TextArea
    readonly
    rows="20"
    value={JSON.stringify(responseJson, null, "  ")}
  />
</Modal>
<button type="button" on:click={toggleRequest}>Debug API request</button>
<button type="button" on:click={toggleResponse}>Debug API response</button>
