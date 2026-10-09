const $ = id => document.getElementById(id);
$('options').onclick = () => chrome.runtime.openOptionsPage();
$('send').onclick = async () => {
  $('status').textContent = 'Submitting...';
  try {
    const result = await chrome.runtime.sendMessage({type: 'ADD_MAGNET', magnet: $('magnet').value.trim()});
    $('status').textContent = result.ok ? `Added torrent: ${result.result}` : `Error: ${result.error}`;
  } catch (error) { $('status').textContent = `Error: ${error.message}`; }
};
