# Photos of the test profiles

`scripts/db-seed-demo.mjs` uses these files for the 20 test profiles (`*@demo.timetomatch.local`).
If a file is missing, the profile keeps its placeholder `/demo/avatar-N.svg`.

**Only AI-generated faces of people who do not exist, or photos of people who agreed to it.**
Never use photos of real people taken from the internet.

Main photo: `demo-N.webp` (or `.jpg` / `.jpeg` / `.png`). Optional extra photos: `demo-N-2.*`, `demo-N-3.*`.
Current files: AI-generated portraits supplied by the owner (301×250). Better: portrait 3:4, at least 900×1200, under ~250 KB each (webp recommended).

| N  | Name    | Gender | Age | City      |
|----|---------|--------|-----|-----------|
| 1  | Anna    | female | 24  | Berlin |
| 2  | Lukas   | male   | 28  | Munich |
| 3  | Camille | female | 26  | Paris |
| 4  | Marco   | male   | 30  | Milan |
| 5  | Lucía   | female | 22  | Madrid |
| 6  | Jakub   | male   | 33  | Warsaw |
| 7  | Sofia   | female | 29  | Rome |
| 8  | Tom     | male   | 27  | Amsterdam |
| 9  | Elena   | female | 31  | Vienna |
| 10 | Pablo   | male   | 25  | Barcelona |
| 11 | Zofia   | female | 23  | Kraków |
| 12 | Julien  | male   | 34  | Lyon |
| 13 | Emma    | female | 25  | Hamburg |
| 14 | Matteo  | male   | 26  | Florence |
| 15 | Chloé   | female | 27  | Brussels |
| 16 | Jonas   | male   | 29  | Zurich |
| 17 | Inês    | female | 24  | Lisbon |
| 18 | Tomasz  | male   | 31  | Wrocław |
| 19 | Alice   | female | 28  | Prague |
| 20 | Luca    | male   | 32  | Bologna |

Photos are applied on the next deploy (the seed runs during the Render build) or locally with
`SEED_DEMO_PROFILES=1 node scripts/db-seed-demo.mjs`.
