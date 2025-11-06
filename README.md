# Tutor Availability Dashboard — Dummy Data Demo

This branch demonstrates the scheduling dashboard without any private data.
It uses local JSON files to emulate the backend and shows how availability is
calculated by subtracting booked sessions from declared availability windows.

Why this exists
- Safe for recruiters and portfolio viewers
- Mirrors the real UX: subject filter, tutor selection, color-coded tutors, weekly view
- No dependencies or external APIs

How it works
1) Data loads from ./data/*.json
2) Availability blocks are reduced by booked events (interval subtraction)
3) Filters apply by subject (CONTAINS) and by selected tutors
4) The UI paints a simple week grid of 30-minute slots

Run locally
- Download this folder
- Open index.html in a browser (no build step)
  - If your browser blocks local JSON fetches, run a simple local server:
    - Python: `python3 -m http.server 8080` then open http://localhost:8080

Files
- index.html — App shell
- styles.css — Minimal styling
- app.js — Data loading, interval math, UI rendering
- data/mock_tutors.json — Tutors, subjects, colors, base availability
- data/mock_events.json — Booked sessions for the week
- data/mock_subjects.json — Example list used by the subject filter's suggestions

Notes
- Colors mimic Teachworks-like palette for familiarity
- This demo targets the next 7 days by default
- All time values are local and naïve; for production, add timezone handling

Author
Nehemiah “Nemo” Cionelo
