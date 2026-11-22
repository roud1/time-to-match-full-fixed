# Photos of the test profiles

`scripts/db-seed-demo.mjs` uses these files for the 20 test profiles (`*@demo.timetomatch.local`).
If a file is missing, the profile keeps its placeholder `/demo/avatar-N.svg`.

**Only AI-generated faces of people who do not exist, or photos of people who agreed to it.**
Never use photos of real people taken from the internet.

Main photo: `demo-N.webp` (or `.jpg` / `.jpeg` / `.png`). Optional extra photos: `demo-N-2.*`, `demo-N-3.*`.
Current files: AI-generated portraits supplied by the owner (301×250). Better: portrait 3:4, at least 900×1200, under ~250 KB each (webp recommended).

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
| 13 | Полина   | female | 25  | Казань          |
| 14 | Никита   | male   | 26  | Санкт-Петербург |
| 15 | Ксения   | female | 27  | Москва          |
| 16 | Максим   | male   | 29  | Екатеринбург    |
| 17 | Дарья    | female | 24  | Сочи            |
| 18 | Егор     | male   | 31  | Новосибирск     |
| 19 | Алиса    | female | 28  | Нижний Новгород |
| 20 | Роман    | male   | 32  | Краснодар       |

Photos are applied on the next deploy (the seed runs during the Render build) or locally with
`SEED_DEMO_PROFILES=1 node scripts/db-seed-demo.mjs`.
