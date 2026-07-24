# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-07-24

Requires **bg3-hud-core 0.6.0**.

Housekeeping release, plus a fix for players not seeing their settings menu.

### Fixed
- **Players can open the Display menu**: The Display settings menu was locked to GMs, so players couldn't set their own preferences (item names, item uses, health overlay, portrait source). It's now available to everyone, and each player's choices apply only to their own view.

### Changed
- **Quieter console**: Routine console messages are now hidden unless you turn on the new Debug Logging setting in the Core module. Warnings and errors still show.
- **Under-the-hood cleanup**: Removed unused files and code, and aligned a few patterns with the other system adapters. No visible change.

## [0.3.1] - 2026-07-13

Requires **bg3-hud-core 0.4.3**.

### Changed
- **Foundry v14 ready**: Verified and working on Foundry v14, and still fully supported on v13.

### Fixed
- **Item tooltips on Foundry v14**: Item descriptions in tooltips no longer come up blank on the new version — they now use Foundry's current way of formatting text, so inline rolls and links display properly.

## [Branch Update: main] - 2026-04-28

### Changed
- Branch update commit for `main` to capture current in-progress module changes.

## [0.3.0] - 2026-04-29

### Changed
- Updated module metadata for `0.3.0` release alignment.
- Updated required `bg3-hud-core` minimum compatibility to `0.3.0`.

## [0.2.3] - 2026-01-28

### Changed
- **Dependency Update**: Updated core dependency to version 0.2.3, which includes:
  - Fix for target selector min targets not updating when max is reduced (Issue #23).
  - Fix for "Hide When BG3 HUD Visible" setting not working correctly (Issue #8).
- **Discord Link Updated**: Updated community Discord invite link.

## [0.1.2] - 2025-12-21
### Changed
- **Dialog Synchronization**: All dialogs are now synchronized to use consistent `DialogV2` styling and behavior (Issue #11).
- **Manifest Updates**: Updated manifest URL to point to `latest` release for easier updates (Issue #10).

## [0.1.1] - 2025-12-19
### Changed
- **DialogV2 Migration**: Updated auto-populate configuration dialog to use core's new `showAutoPopulateConfigDialog()` utility for consistent Foundry V13 styling.

## [0.1.0] - 2025-12-19
### Added
- Initial release of `bg3-hud-dc20rpg`.
