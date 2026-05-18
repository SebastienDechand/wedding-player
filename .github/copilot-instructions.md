# Copilot Instructions for wedding-player

## Project Goal

Build a romantic music player for a wedding gift and a 7-year relationship milestone.

The app should feel like a custom vintage turntable player, inspired by a cozy illustrated desktop music widget:

- animated record player visuals
- tonearm movement tied to play/pause
- spinning disc that reacts to playback
- long-title marquee / scrolling text for track names
- soft, romantic, handcrafted visual direction

The product must work in two targets:

- desktop with Angular + Electron
- mobile with Angular + Ionic

Spotify integration is intentionally postponed for now. The first version should use local placeholder data and placeholder assets.

## Product Scope

Priorities for the current version:

1. A polished visual prototype of the player
2. A playable local playlist using placeholder songs and metadata
3. 3 to 4 selectable visual themes
4. 7 relationship-themed easter eggs to add later
5. Responsive behavior for desktop and mobile

Later additions:

- Spotify playlist support
- more advanced playback interactions
- desktop packaging and mobile builds

## Visual Direction

The interface should be intentionally styled, not generic.

Preferred qualities:

- romantic, nostalgic, and playful atmosphere
- animated illustrations or SVG/CSS-based visuals
- distinct themes with different moods
- soft shadows, gradients, and tactile surfaces
- desktop-first polish, but mobile-safe layout

Avoid:

- boring default dashboards
- flat enterprise UI
- generic purple-on-white styling
- overused template layouts

## Technical Direction

Use this stack:

- Angular 20 for the app
- Electron for desktop
- Ionic for mobile

Implementation preferences:

- prefer standalone Angular patterns
- keep components small and focused
- use CSS variables for themes
- use placeholder assets until final artwork is available
- keep playback state and animation state clearly separated

## Player Behavior

The player should support:

- play and pause controls
- record spinning while playing
- tonearm animation that changes with playback state
- track title display that can scroll when long
- theme-specific styling
- a path for later playlist expansion

## Easter Eggs

The long-term plan includes 7 hidden relationship easter eggs.

When implementing them later:

- make them discoverable but not intrusive
- tie them to meaningful moments or interactions
- keep them emotionally personal rather than gimmicky

## Coding Style

When writing or changing code:

- keep changes minimal and focused on the current slice
- preserve existing style unless a change requires otherwise
- use clear names for components, services, and state
- add comments only when the logic is not obvious
- prefer working code with placeholders over unfinished abstractions

## Delivery Order

Recommended sequence:

1. visual prototype
2. playback animation logic
3. local playlist management
4. themes
5. easter eggs
6. mobile adaptation
7. Electron packaging
8. Spotify integration
