# Changelog

## [1.0.1] - 2025-06-30

### Fixed
- Removed `user-scalable=no` from viewport meta tag to improve accessibility
- Fixed memory leaks in TraeAwakensPage by properly cleaning up timeouts and intervals
- Added proper focus management for keyboard navigation
- Implemented 404 page for invalid routes
- Fixed navigation issues with browser back/forward buttons
- Added proper cleanup for audio resources
- Improved error handling and recovery

### Added
- Added FocusManager component for better accessibility
- Added comprehensive error boundary with user-friendly fallback UI
- Added audio and vibration utility functions with better error handling
- Added proper language switching with URL parameter updates
- Added comprehensive deployment documentation

### Changed
- Updated build configuration to properly minify and optimize code
- Improved performance by reducing unnecessary re-renders
- Enhanced security headers in index.html
- Improved loading experience with initial loader
- Updated error logging to be more robust

### Security
- Removed console.log statements in production builds
- Added Content-Security-Policy headers
- Added X-Content-Type-Options and X-Frame-Options headers

## [1.0.0] - 2025-06-29

### Added
- Initial release of NeuropulAI
- Awakening portal with three paths: Lost Soul, Awakening, and Ready
- XP system with level progression
- Multi-language support (Russian and Uzbek)
- Cyberpunk-themed UI with animations
- Sound effects and vibration feedback
- Responsive design for all devices
- Error logging and tracking
- Localization system