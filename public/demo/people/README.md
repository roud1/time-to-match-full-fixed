# Photos of the test profiles

`scripts/db-seed-demo.mjs` uses these files for the 12 test profiles (`*@demo.timetomatch.local`).
If a file is missing, the profile keeps its placeholder `/demo/avatar-N.svg`.

**Only AI-generated faces of people who do not exist, or photos of people who agreed to it.**
Never use photos of real people taken from the internet.

Main photo: `demo-N.webp` (or `.jpg` / `.jpeg` / `.png`). Optional extra photos: `demo-N-2.*`, `demo-N-3.*`.
Portrait 3:4, at least 900×1200, under ~250 KB each (webp recommended).

| N  | Name     | Gender | Age | City            |
|----|----------|--------|-----|-----------------|
| 1  | Анна     | female | 24  | Москва          |
| 2  | Дмитрий  | male   | 28  | Санкт-Петербург |
| 3  | Елена    | female | 26  | Екатеринбург    |
| 4  | Иван     | male   | 30  | Казань          |
| 5  | Мария    | female | 22  | Новосибирск     |
| 6  | Алексей  | male   | 33  | Москва          |
| 7  | Ольга    | female | 29  | Санкт-Петербург |
| 8  | Сергей   | male   | 27  | Краснодар       |
| 9  | Наталья  | female | 31  | Москва          |
| 10 | Павел    | male   | 25  | Нижний Новгород |
| 11 | Виктория | female | 23  | Ростов-на-Дону  |
| 12 | Артём    | male   | 34  | Москва          |

Photos are applied on the next deploy (the seed runs during the Render build) or locally with
`SEED_DEMO_PROFILES=1 node scripts/db-seed-demo.mjs`.
