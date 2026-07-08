/**
 * Email HTML templates — minimal, dark, on-brand.
 * All templates are inline-CSS for email client compatibility.
 */

const BASE = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080b10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080b10;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
        <!-- Logo -->
        <tr><td style="padding:0 0 32px;text-align:center;">
          <span style="font-size:20px;font-weight:700;letter-spacing:-0.03em;
            background:linear-gradient(135deg,#f72585,#b5179e,#7209b7);
            -webkit-background-clip:text;-webkit-text-fill-color:transparent;
            background-clip:text;color:transparent;">
            Time to Match
          </span>
        </td></tr>
        <!-- Card -->
        <tr><td style="background:#0d1117;border:0.5px solid rgba(247,37,133,0.18);
          border-radius:20px;padding:36px 32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 0 0;text-align:center;
          font-size:11px;color:rgba(245,245,247,0.28);line-height:1.6;">
          You received this email because you signed up for Time to Match.<br>
          If you didn't create an account, you can safely ignore this email.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const BTN = (href: string, label: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td align="center">
      <a href="${href}" style="display:inline-block;padding:14px 32px;
        background:linear-gradient(135deg,#f72585,#b5179e,#7209b7);
        color:#fff;font-size:15px;font-weight:600;text-decoration:none;
        border-radius:9999px;letter-spacing:0.01em;">
        ${label}
      </a>
    </td></tr>
  </table>`

const H1 = (text: string) =>
  `<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;
    letter-spacing:-0.025em;color:#f5f5f7;">${text}</h1>`

const P = (text: string) =>
  `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;
    color:rgba(245,245,247,0.62);">${text}</p>`

const SMALL = (text: string) =>
  `<p style="margin:16px 0 0;font-size:11px;line-height:1.5;
    color:rgba(245,245,247,0.28);">${text}</p>`

// ─────────────────────────────────────────────────────────────────────────────

export function emailVerifyTemplate(opts: {
  name: string
  verifyUrl: string
}): { subject: string; html: string } {
  return {
    subject: "Confirm your Time to Match email",
    html: BASE(`
      ${H1("Confirm your email")}
      ${P(`Hi ${opts.name}, welcome to Time to Match.`)}
      ${P("Click the button below to verify your email address and activate your account. The link expires in 24 hours.")}
      ${BTN(opts.verifyUrl, "Confirm email")}
      ${SMALL(`Or copy this link: <a href="${opts.verifyUrl}" style="color:rgba(247,37,133,0.8);">${opts.verifyUrl}</a>`)}
    `),
  }
}

export function passwordResetTemplate(opts: {
  name: string
  resetUrl: string
}): { subject: string; html: string } {
  return {
    subject: "Reset your Time to Match password",
    html: BASE(`
      ${H1("Reset your password")}
      ${P(`Hi ${opts.name}, we received a request to reset your password.`)}
      ${P("Click the button below to choose a new password. This link expires in 1 hour.")}
      ${BTN(opts.resetUrl, "Reset password")}
      ${SMALL("If you didn't request this, you can safely ignore this email. Your password won't change.")}
    `),
  }
}

export function matchExpiringSoonTemplate(opts: {
  name: string
  peerName: string
  chatUrl: string
  hoursLeft: number
}): { subject: string; html: string } {
  return {
    subject: `⏳ Your match with ${opts.peerName} expires in ${opts.hoursLeft}h`,
    html: BASE(`
      ${H1(`${opts.hoursLeft} hours left.`)}
      ${P(`Hi ${opts.name}, your match with <strong style="color:#f5f5f7;">${opts.peerName}</strong> is expiring soon.`)}
      ${P("Say what matters before the window closes.")}
      ${BTN(opts.chatUrl, "Open chat")}
      ${SMALL("After 24 hours the conversation disappears forever.")}
    `),
  }
}

export function newMatchTemplate(opts: {
  name: string
  peerName: string
  chatUrl: string
}): { subject: string; html: string } {
  return {
    subject: `✦ You matched with ${opts.peerName}`,
    html: BASE(`
      ${H1("It's a match.")}
      ${P(`Hi ${opts.name}, you and <strong style="color:#f5f5f7;">${opts.peerName}</strong> liked each other.`)}
      ${P("Your 24 hours just started. Say something real before it runs out.")}
      ${BTN(opts.chatUrl, "Say something real")}
      ${SMALL("After 24 hours this conversation disappears forever.")}
    `),
  }
}
