# Changelog

All notable changes to this project will be documented in this file.

### Added

#### Zoom Features
- **Remote Zoom Sync Plugin** — New plugin for synchronizing zoom actions with followers using reveal.js' native zoom implementation (Ctrl+Click to zoom)
- **Ctrl+Click Zoom** — Presenter can now zoom with Ctrl+Click, with synchronized zoom mirroring to all followers

#### Remote Control Features
- **Goto Slide Feature** — Add the ability to navigate directly to a specific slide from the remote control
- **Keyboard Bindings** — Remote control now mirrors keyboard bindings from reveal.js for consistent interaction
- **Anchor Navigation** — Added support for navigating to anchors from the reveal remote control

#### Synchronization & Multiplex
- **onBeforeSync Hook** — New async hook to intercept incoming multiplex state before application, allowing host apps to suppress or defer state changes
- **Pause Multiplexing** — Added ability to pause/resume multiplexing during a presentation
- **suppressInOverview Config Flag** — New opt-in configuration flag to prevent broadcasting state to remotes/audience while presenter is in Overview mode

#### Video Synchronization
- **Video Command Relay** — New feature for real-time play/pause/seek synchronization of slide video elements across followers
- **Custom Socket Messages** — Exposed `sendMessage()` and `onMessage()` on the plugin API to allow host applications to send custom socket messages over the established multiplex connection

#### Server & UI
- **Presentation Preview** — Added presentation preview functionality to the remote server UI
- **URL Normalization Hook** — New hook to allow callers to normalize share URLs for custom implementations
- **Multiplex URL Sharing** — Added server protocol parameter to support sharing the remote multiplex URL
- **Remote Server UI Tweaks** — Various small UI improvements to the remote server interface

### Changed

- **normalizeShareUrl Hook** — Moved to onConnect function to ensure localstorage keys match properly

### Deprecated

- **Legacy remotezoom Plugin** — The original remotezoom plugin is now marked as legacy. New implementations should use the Remote Zoom Sync plugin for recent versions of reveal.js.
