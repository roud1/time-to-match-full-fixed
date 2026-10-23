#!/usr/bin/env node
/**
 * Demo/test data: creates fake profiles so the Discover feed is not empty and
 * "likes" can be tested. Runs only when SEED_DEMO_PROFILES=1 (otherwise exits 0).
 * Idempotent: safe to run on every deploy.
 *
 *  - 12 demo users (emails *@demo.timetomatch.local, cannot log in)
 *  - the first 4 demo users have already liked every real user, so liking them
 *    back should produce a match and a "someone liked you" entry
 *
 * Remove everything later:  DELETE FROM users WHERE email LIKE '%@demo.timetomatch.local';
 */
import bcrypt from "bcryptjs"
import crypto from "node:crypto"
import postgres from "postgres"

if (process.env.SEED_DEMO_PROFILES !== "1") {
  console.log("seed-demo: SEED_DEMO_PROFILES is not 1 — skipping")
  process.exit(0)
}
const url = process.env.DATABASE_URL
if (!url) {
  console.error("seed-demo: DATABASE_URL is not set")
  process.exit(1)
}

const DOMAIN = "demo.timetomatch.local"
const DEMO = [
  { n: "Анна", g: "female", age: 24, city: "Москва", bio: "Люблю кофе, долгие прогулки и книги. Ищу человека для спонтанных поездок.", i: [12, 4, 5, 18] },
  { n: "Дмитрий", g: "male", age: 28, city: "Санкт-Петербург", bio: "Разработчик, готовлю пасту и хожу в горы по выходным.", i: [7, 5, 3, 24] },
  { n: "Елена", g: "female", age: 26, city: "Екатеринбург", bio: "Дизайнер. Обожаю выставки, винил и тёплые вечера на балконе.", i: [10, 2, 18, 21] },
  { n: "Иван", g: "male", age: 30, city: "Казань", bio: "Строю свой бизнес, люблю бег по утрам и хорошее кино.", i: [26, 1, 24, 14] },
  { n: "Мария", g: "female", age: 22, city: "Новосибирск", bio: "Учусь, занимаюсь йогой и мечтаю увидеть океан.", i: [15, 5, 13, 23] },
  { n: "Алексей", g: "male", age: 33, city: "Москва", bio: "Фотографирую города, собираю плейлисты и ищу компанию на концерты.", i: [18, 2, 5, 25] },
  { n: "Ольга", g: "female", age: 29, city: "Санкт-Петербург", bio: "Работаю в театре, люблю вино и разговоры до утра.", i: [21, 20, 4, 10] },
  { n: "Сергей", g: "male", age: 27, city: "Краснодар", bio: "Сёрфинг летом, сноуборд зимой. Ищу того, кто не боится волн.", i: [22, 3, 5, 9] },
  { n: "Наталья", g: "female", age: 31, city: "Москва", bio: "Врач с чувством юмора. Бег, кулинария и хорошие сериалы.", i: [26, 7, 1, 16] },
  { n: "Павел", g: "male", age: 25, city: "Нижний Новгород", bio: "Музыкант. Играю на гитаре и пишу песни для близких.", i: [2, 8, 6, 12] },
  { n: "Виктория", g: "female", age: 23, city: "Ростов-на-Дону", bio: "Фитнес-тренер. Люблю активный отдых и тёплое море.", i: [17, 13, 5, 3] },
  { n: "Артём", g: "male", age: 34, city: "Москва", bio: "Инженер, путешествую по России на машине, люблю подкасты.", i: [14, 25, 5, 11] },
]

function birthdateForAge(age, idx) {
  const d = new Date()
  d.setFullYear(d.getFullYear() - age)
  d.setMonth((idx * 5) % 12)
  d.setDate(1 + ((idx * 7) % 27))
  return d.toISOString().slice(0, 10)
}

const sql = postgres(url, { max: 1, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require" })
try {
  const hash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 8) // random, never known
  const ids = []
  for (let idx = 0; idx < DEMO.length; idx++) {
    const p = DEMO[idx]
    const email = `demo${idx + 1}@${DOMAIN}`
    const photo = `/demo/avatar-${idx + 1}.svg`
    const birthdate = birthdateForAge(p.age, idx)
    const profile = {
      gender: p.g,
      birthdate,
      bio: p.bio,
      customCity: p.city,
      photoUrl: photo,
      photoUrls: [photo],
      demo: true,
    }
    const [row] = await sql`
      INSERT INTO users (email, password_hash, name, profile, gender, bio, birth_date,
                         location_city, email_verified, photo_verified, is_active,
                         profile_expires_at, last_active_at)
      VALUES (${email}, ${hash}, ${p.n}, ${sql.json(profile)}, ${p.g}, ${p.bio}, ${birthdate},
              ${p.city}, true, ${idx % 2 === 0}, true,
              now() + interval '30 days', now())
      ON CONFLICT (email_normalized) DO UPDATE SET
        name = EXCLUDED.name, profile = EXCLUDED.profile, gender = EXCLUDED.gender,
        bio = EXCLUDED.bio, location_city = EXCLUDED.location_city,
        is_active = true, is_blocked = false,
        profile_expires_at = now() + interval '30 days', last_active_at = now()
      RETURNING id
    `
    ids.push(row.id)
    for (const interestId of p.i) {
      await sql`
        INSERT INTO user_interests (user_id, interest_id)
        SELECT ${row.id}, id FROM interests WHERE id = ${interestId}
        ON CONFLICT DO NOTHING
      `
    }
  }

  // Incoming likes from the first 4 demo users to every real user.
  const real = await sql`SELECT id FROM users WHERE email_normalized NOT LIKE ${"%@" + DOMAIN}`
  let likes = 0
  for (const r of real) {
    for (const demoId of ids.slice(0, 4)) {
      const res = await sql`
        INSERT INTO likes (from_user, to_user, is_match, is_frozen, is_expired)
        SELECT ${demoId}, ${r.id}, false, false, false
        WHERE NOT EXISTS (
          SELECT 1 FROM likes WHERE from_user = ${r.id} AND to_user = ${demoId}
        )
        ON CONFLICT (from_user, to_user) DO NOTHING
        RETURNING 1
      `
      likes += res.length
    }
  }
  console.log(`seed-demo: ${ids.length} demo profiles ready, ${real.length} real user(s), ${likes} new incoming like(s)`)
} finally {
  await sql.end()
}
