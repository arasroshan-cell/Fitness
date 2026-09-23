# Roshan Fitness Tracker — public repo (hosting only)

This repo (`arasroshan-cell/Fitness`) is public and serves the live app via GitHub Pages.
It holds only what GitHub Pages needs to serve the app — `index.html`, `manifest.json`,
`icon.svg` — and nothing else. `MASTER_PLAN.md`, `tests.js`, the full build and edit rules,
Sweta's tracker files, and all personal or medical context live in the private repo
`arasroshan-cell/Phitness`.

## Do this first, every session
Add `arasroshan-cell/Phitness` to the session if it is not already attached, then read
its `CLAUDE.md` and `MASTER_PLAN.md` before doing anything here. Do not guess at build
rules, version state, or open items from this file or from `index.html` alone — this file
is deliberately minimal and carries no memory of project state.

## Privacy — this repo is public, never forget it
Never commit Roshan's name, location, diagnosis, medication names, or any other personal
or medical specifics into any file in this repo. If a feature genuinely needs personal
specifics in the shipped app (e.g. profile data), keep them in the user's own
`localStorage` profile object at runtime, never hardcoded in `index.html`'s source.

## Medical — non-negotiable, repeated here since it governs what ships
Never suggest or enable squats, deadlifts, or any Valsalva-style breath-holding under
load. Full medical context is in `MASTER_PLAN.md` Section 2 in the private repo.
