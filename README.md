# Deluge Siphon MV3

Send BitTorrent magnet links to Deluge WebUI from Brave or another Chromium browser. This is an independent implementation, separate from sbussetti/deluge-siphon. The original repository is unchanged.

## Install in Brave

1. Download and extract `deluge-siphon-mv3.zip` from this repository.
2. Open `brave://extensions` and enable Developer mode.
3. Choose **Load unpacked** and select the extracted folder containing `manifest.json`.
4. Open the extension's **Settings**, enter your Deluge WebUI URL and password, then choose **Test connection**.
5. Click a magnet link, right-click a magnet link and choose **Send magnet to Deluge**, or paste a magnet into the extension popup.

The ZIP is a source package, not a Chrome Web Store listing or a signed CRX. Load its extracted contents with Load unpacked.

## Configuration

Use the WebUI base URL, including a reverse-proxy path when applicable. The extension adds `/json` automatically. The WebUI must have a reachable, configured Deluge daemon. If several daemons are online, the first reachable daemon is selected when the WebUI is disconnected.

Settings, including the WebUI password, stay in this browser's local extension storage. HTTP transmits the password without transport encryption; use HTTPS when available. HTTP and HTTPS site access enables magnet interception and requests to your configured WebUI. Automatic interception can be disabled in Settings.

Only BitTorrent v1 magnets starting with `magnet:?xt=urn:btih:` are supported. Torrent-file links and v2-only magnets are not implemented. Duplicate torrents may return an error.

## Validation

Version 1.0.1 corrects daemon selection by querying `web.get_host_status`, instead of interpreting the username returned by `web.get_hosts` as an online status. JavaScript syntax and mocked authentication, daemon selection, submission, and failure paths were checked. Live Brave loading and actual Deluge submission require separate browser verification; these are not implied by static checks.

Brave documents Chromium extension support: https://support.brave.com/hc/en-us/articles/360017909112-How-can-I-add-extensions-to-Brave
