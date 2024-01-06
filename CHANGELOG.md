# Change Log - Geyserwala Connect - Node-RED Plugin

## [0.0.6] - 2024-01-06

Fix import flows from older versions

## [0.0.5] - 2023-12-20

Allow for custom signals

### Added
- Custom node.

## [0.0.4] - 2023-12-05

Migrate to persistent latch signals, with programmable hold time

### Added
- `external-disable` signal, accepts integer of number or seconds to latch, or true (defaults to 24 hours). Zero/false will clear.

### Changed
- naming to geyserwala-connect-...
- `external-demand` signal: accepts integer of number of seconds to latch, or true (defaults to 24 hours). Zero/false will clear.

### Removed
- `lowpower-enable`: replaced by `external-disable`.

## [0.0.3] - 2023-09-01

Initial development
