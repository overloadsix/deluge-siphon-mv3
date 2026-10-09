let autoIntercept = true;
chrome.storage.local.get('autoIntercept').then(settings => {
  autoIntercept = settings.autoIntercept !== false;
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.autoIntercept) autoIntercept = changes.autoIntercept.newValue !== false;
});
document.addEventListener('click', async event => {
  const anchor = event.target.closest?.('a[href^="magnet:"]');
  if (!anchor || !autoIntercept || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  event.stopPropagation();
  try {
    const result = await chrome.runtime.sendMessage({type: 'ADD_MAGNET', magnet: anchor.href});
    window.alert(result?.ok ? 'Magnet sent to Deluge.' : `Deluge error: ${result?.error || 'Unknown error'}`);
  } catch (error) { window.alert(`Deluge Siphon: ${error.message}`); }
}, true);
