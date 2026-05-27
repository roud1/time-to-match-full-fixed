import webpush from "web-push"

const keys = webpush.generateVAPIDKeys()
console.log("Add to .env.local:\n")
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log("VAPID_SUBJECT=mailto:you@example.com")
console.log("\nGenerate with: node scripts/generate-vapid-keys.mjs")
