// The app is a thin native shell around the hosted web app.
// APP_URL (GitHub secret) overrides the default address at build time.
const base = (process.env.APP_URL || "https://time-to-match-web.onrender.com").replace(/\/+$/, "")
// Set by the APK workflow when Firebase config (google-services.json) is available.
const pushEnabled = process.env.PUSH_ENABLED === "1"

module.exports = {
  appId: "com.timetomatch.app",
  appName: "Luvia",
  webDir: "www",
  backgroundColor: "#0d0a17",
  server: {
    url: `${base}/`,
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
    // Lets the website recognise the native app (see app/layout.tsx -> data-ttm-app).
    // "TTMPush" tells the website that native notifications can be used in this build.
    appendUserAgent: pushEnabled ? "TTMApp/1 TTMPush/1" : "TTMApp/1",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
}
