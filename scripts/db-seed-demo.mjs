#!/usr/bin/env node
/**
 * Demo/test data: creates fake profiles so the Discover feed is not empty and
 * "likes" can be tested. Runs only when SEED_DEMO_PROFILES=1 (otherwise exits 0).
 * Idempotent: safe to run on every deploy.
 *
 *  - 20 demo users (emails *@demo.timetomatch.local, cannot log in)
 *  - the first 4 demo users have already liked every real user, so liking them
 *    back should produce a match and a "someone liked you" entry
 *
 * Remove everything later:  DELETE FROM users WHERE email LIKE '%@demo.timetomatch.local';
 */
import bcrypt from "bcryptjs"
import crypto from "node:crypto"
import postgres from "postgres"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

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
// European test profiles (owner's market). Odd numbers are women, even numbers men, matching the
// portraits in public/demo/people. Bios are in English so they read fine in every app language.
const DEMO = [
  { n: "Anna", g: "female", age: 24, city: "Berlin", bio: "Coffee, long walks and good books. Looking for someone up for spontaneous trips.", i: [12, 4, 5, 18] },
  { n: "Lukas", g: "male", age: 28, city: "Munich", bio: "Software developer. I cook pasta and spend weekends in the mountains.", i: [7, 5, 3, 24] },
  { n: "Camille", g: "female", age: 26, city: "Paris", bio: "Designer. Exhibitions, vinyl and warm evenings on the balcony.", i: [10, 2, 18, 21] },
  { n: "Marco", g: "male", age: 30, city: "Milan", bio: "Building my own business. Morning runs and a good film in the evening.", i: [26, 1, 24, 14] },
  { n: "Lucía", g: "female", age: 22, city: "Madrid", bio: "Student, yoga every morning and dreaming of seeing the ocean.", i: [15, 5, 13, 23] },
  { n: "Jakub", g: "male", age: 33, city: "Warsaw", bio: "I photograph cities, make playlists and look for company for concerts.", i: [18, 2, 5, 25] },
  { n: "Sofia", g: "female", age: 29, city: "Rome", bio: "I work in theatre. Wine and conversations until sunrise.", i: [21, 20, 4, 10] },
  { n: "Tom", g: "male", age: 27, city: "Amsterdam", bio: "Surfing in summer, snowboarding in winter. Not afraid of waves?", i: [22, 3, 5, 9] },
  { n: "Elena", g: "female", age: 31, city: "Vienna", bio: "Doctor with a sense of humour. Running, cooking and good series.", i: [26, 7, 1, 16] },
  { n: "Pablo", g: "male", age: 25, city: "Barcelona", bio: "Musician. I play guitar and write songs for the people I love.", i: [2, 8, 6, 12] },
  { n: "Zofia", g: "female", age: 23, city: "Kraków", bio: "Fitness coach. Active weekends and warm seas.", i: [17, 13, 5, 3] },
  { n: "Julien", g: "male", age: 34, city: "Lyon", bio: "Engineer. Road trips across Europe and lots of podcasts.", i: [14, 25, 5, 11] },
  { n: "Emma", g: "female", age: 25, city: "Hamburg", bio: "Marketing by day, nature and sunsets at the weekend.", i: [9, 4, 12, 19] },
  { n: "Matteo", g: "male", age: 26, city: "Florence", bio: "Architect. I cycle everywhere and collect records.", i: [10, 18, 3, 6] },
  { n: "Chloé", g: "female", age: 27, city: "Brussels", bio: "I write for a living, love stand-up and know every good café in town.", i: [4, 16, 20, 1] },
  { n: "Jonas", g: "male", age: 29, city: "Zurich", bio: "Climbing coach. Mountains, hiking and a campfire with a guitar.", i: [3, 9, 22, 8] },
  { n: "Inês", g: "female", age: 24, city: "Lisbon", bio: "Photographer. The sea, travel and last-minute weekend trips.", i: [5, 2, 13, 15] },
  { n: "Tomasz", g: "male", age: 31, city: "Wrocław", bio: "Developer and board-game fan. Skiing in winter, lakes in summer.", i: [24, 7, 11, 9] },
  { n: "Alice", g: "female", age: 28, city: "Prague", bio: "Working in tech, learning Spanish and dreaming of Barcelona.", i: [26, 5, 17, 21] },
  { n: "Luca", g: "male", age: 32, city: "Bologna", bio: "Chef. I cook for friends and love markets and wine.", i: [16, 20, 1, 12] },
]

// Photos of the test profiles: public/demo/people/demo-<N>.(jpg|jpeg|png|webp), extra ones demo-<N>-2, demo-<N>-3.
// Only AI-generated faces of non-existent people (or people who agreed) belong there — see README.md in that folder.
const PEOPLE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "demo", "people")
const PHOTO_EXT = ["webp", "jpg", "jpeg", "png"]

function demoPhotos(n) {
  const found = []
  for (const suffix of ["", "-2", "-3"]) {
    for (const ext of PHOTO_EXT) {
      const file = `demo-${n}${suffix}.${ext}`
      if (fs.existsSync(path.join(PEOPLE_DIR, file))) {
        found.push(`/demo/people/${file}`)
        break
      }
    }
  }
  return found.length > 0 ? found : [`/demo/avatar-${n}.svg`]
}

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
    const photos = demoPhotos(idx + 1)
    const birthdate = birthdateForAge(p.age, idx)
    const profile = {
      gender: p.g,
      birthdate,
      bio: p.bio,
      customCity: p.city,
      photoUrl: photos[0],
      photoUrls: photos,
      demo: true,
    }
    const [row] = await sql`
      INSERT INTO users (email, password_hash, name, profile, gender, bio, birth_date,
                         location_city, email_verified, photo_verified, is_active,
                         profile_expires_at, last_active_at)
      VALUES (${email}, ${hash}, ${p.n}, ${sql.json(profile)}, ${p.g}, ${p.bio}, ${birthdate},
              ${p.city}, true, false, true,
              now() + interval '30 days', now())
      ON CONFLICT (email_normalized) DO UPDATE SET
        name = EXCLUDED.name, profile = EXCLUDED.profile, gender = EXCLUDED.gender,
        bio = EXCLUDED.bio, location_city = EXCLUDED.location_city,
        is_active = true, is_blocked = false,
        -- Test profiles are never photo-verified (no fabricated verification badges).
        photo_verified = false,
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
  if (process.env.AUTO_VERIFY_EMAIL === "1" && !process.env.RESEND_API_KEY) {
    const verified = await sql`UPDATE users SET email_verified = true WHERE email_verified IS NOT TRUE RETURNING 1`
    console.log(`seed-demo: auto-verified ${verified.length} existing account(s) (AUTO_VERIFY_EMAIL=1, no RESEND_API_KEY)`)
  }
  console.log(`seed-demo: ${ids.length} demo profiles ready, ${real.length} real user(s), ${likes} new incoming like(s)`)
} finally {
  await sql.end()
}
