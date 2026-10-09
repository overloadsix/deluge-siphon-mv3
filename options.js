const $ = id => document.getElementById(id);
(async () => {
  const saved = await chrome.storage.local.get(['url', 'password', 'autoIntercept']);
  $('url').value = saved.url || '';
  $('password').value = saved.password || '';
  $('autoIntercept').checked = saved.autoIntercept !== false;
})();
async function save() {
  const url = $('url').value.trim();
  if (!url) throw new Error('Enter your Deluge WebUI URL');
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Use http:// or https://');
  await chrome.storage.local.set({url, password: $('password').value, autoIntercept: $('autoIntercept').checked});
  $('status').textContent = 'Settings saved.';
}
$('save').addEventListener('click', () => save().catch(e => $('status').textContent = e.message));
$('test').addEventListener('click', async () => {
  try {
    await save();
    const result = await chrome.runtime.sendMessage({type: 'TEST_CONNECTION'});
    $('status').textContent = result.ok ? 'Connected to Deluge WebUI and daemon.' : `Connection failed: ${result.error}`;
  } catch (e) { $('status').textContent = `Connection failed: ${e.message}`; }
});
