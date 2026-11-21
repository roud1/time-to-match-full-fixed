// The app is a thin native shell around the hosted web app.
// APP_URL (GitHub secret) overrides the default address at build time.
const base = (process.env.APP_URL || "https://time-to-match-web.onrender.com").replace(/\/+$/, "")

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
    appendUserAgent: "TTMApp/1",
  },
}
