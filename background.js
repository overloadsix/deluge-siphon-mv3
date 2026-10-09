const menuId = 'send-to-deluge';
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: menuId, title: 'Send magnet to Deluge', contexts: ['link'] }, () => {
    if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message);
  });
});
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === menuId && info.linkUrl) submitMagnet(info.linkUrl).catch(reportError);
});
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'ADD_MAGNET') {
    submitMagnet(msg.magnet).then(result => sendResponse({ok: true, result})).catch(error => sendResponse({ok: false, error: error.message}));
    return true;
  }
  if (msg?.type === 'TEST_CONNECTION') {
    connectDeluge().then(() => sendResponse({ok: true})).catch(error => sendResponse({ok: false, error: error.message}));
    return true;
  }
});
function reportError(error) {
  console.error('Deluge Siphon:', error);
  chrome.notifications.create({type: 'basic', iconUrl: 'icon.png', title: 'Deluge Siphon error', message: error.message || String(error)});
}
function normalizeServer(raw) {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Deluge WebUI URL must use http or https');
  url.pathname = url.pathname.replace(/\/$/, '') + '/json';
  url.search = '';
  url.hash = '';
  return url.href;
}
async function rpc(server, method, params = []) {
  const response = await fetch(server, {method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({method, params, id: 1})});
  if (!response.ok) throw new Error(`Deluge WebUI HTTP ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.result;
}
async function connectDeluge() {
  const {url, password} = await chrome.storage.local.get(['url', 'password']);
  if (!url) throw new Error('Configure the Deluge WebUI URL in extension Options');
  const server = normalizeServer(url);
  if (!await rpc(server, 'auth.login', [password || ''])) throw new Error('Deluge password rejected');
  let connected = await rpc(server, 'web.connected');
  if (!connected) {
    const hosts = await rpc(server, 'web.get_hosts');
    let available;
    for (const host of hosts) {
      const status = await rpc(server, 'web.get_host_status', [host[0]]);
      if (['Online', 'Connected'].includes(status?.[1])) { available = host; break; }
    }
    if (!available) throw new Error('No Deluge daemon is configured in WebUI Connection Manager');
    await rpc(server, 'web.connect', [available[0]]);
    connected = await rpc(server, 'web.connected');
    if (!connected) throw new Error('WebUI authenticated but did not connect to a Deluge daemon');
  }
  return server;
}
async function submitMagnet(magnet) {
  if (typeof magnet !== 'string' || !magnet.startsWith('magnet:?xt=urn:btih:')) throw new Error('Not a supported BitTorrent magnet link');
  const server = await connectDeluge();
  const result = await rpc(server, 'core.add_torrent_magnet', [magnet, {}]);
  if (!result) throw new Error('Deluge returned no torrent ID. Check for an existing duplicate or daemon error.');
  return result;
}
