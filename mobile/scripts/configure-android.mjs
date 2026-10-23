#!/usr/bin/env node
/**
 * Run after `npx cap add android`:
 *  - adds the permissions the web app needs (camera/mic for calls, location, notifications)
 *  - locks the orientation to portrait
 *  - installs the launcher icons from ./resources/res
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const mainDir = path.join(root, "android", "app", "src", "main")
const manifestPath = path.join(mainDir, "AndroidManifest.xml")
if (!fs.existsSync(manifestPath)) {
  console.error("android project not found — run `npx cap add android` first")
  process.exit(1)
}

let xml = fs.readFileSync(manifestPath, "utf8")

const perms = [
  "android.permission.CAMERA",
  "android.permission.RECORD_AUDIO",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.POST_NOTIFICATIONS",
]
let add = ""
for (const p of perms) {
  if (!xml.includes(`"${p}"`)) add += `    <uses-permission android:name="${p}" />\n`
}
if (!xml.includes("android.hardware.camera")) {
  add += `    <uses-feature android:name="android.hardware.camera" android:required="false" />\n`
  add += `    <uses-feature android:name="android.hardware.microphone" android:required="false" />\n`
}
if (add) xml = xml.replace("</manifest>", `${add}</manifest>`)

if (!xml.includes("screenOrientation")) {
  xml = xml.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:screenOrientation="portrait"')
}
fs.writeFileSync(manifestPath, xml)

// build.gradle: fixed debug keystore (so new APKs install over old ones) + version from CI
const gradlePath = path.join(root, "android", "app", "build.gradle")
let gradle = fs.readFileSync(gradlePath, "utf8")
if (!gradle.includes("signingConfigs")) {
  gradle = gradle.replace(
    "android {\n",
    `android {
    signingConfigs {
        debug {
            storeFile file("../../debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }
    }
`,
  )
}
const run = process.env.VERSION_CODE || "1"
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${run}`).replace(/versionName\s+"[^"]*"/, `versionName "1.0.${run}"`)
fs.writeFileSync(gradlePath, gradle)

// icons
const src = path.join(root, "resources", "res")
const dst = path.join(mainDir, "res")
function copyDir(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const f = path.join(from, entry.name)
    const t = path.join(to, entry.name)
    if (entry.isDirectory()) {
      fs.mkdirSync(t, { recursive: true })
      copyDir(f, t)
    } else {
      fs.copyFileSync(f, t)
    }
  }
}
copyDir(src, dst)
console.log("configure-android: manifest + icons updated")
