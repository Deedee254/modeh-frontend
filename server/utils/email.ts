import nodemailer from 'nodemailer'

/**
 * Custom email verification request handler for NextAuth.js
 * Sends magic link emails with branded template
 */
export async function sendVerificationRequest(params: {
  identifier: string
  url: string
  expires: number
  provider: any
  theme: string
}) {
  const { identifier: email, url, expires, provider } = params
  const { host } = new URL(url)

  const transporter = nodemailer.createTransport(provider.server)

  // Extract the token from the callback URL
  const callbackUrl = new URL(url)
  const token = callbackUrl.searchParams.get('token')

  const expirationTime = new Date(expires)
  const expirationHours = Math.round((expires - Date.now()) / (1000 * 60 * 60))

  try {
    await transporter.sendMail({
      to: email,
      from: provider.from,
      subject: '🔐 Your Modeh Magic Sign-In Link',
      html: generateMagicLinkEmail({
        email,
        url,
        token: token || '',
        expirationTime,
        expirationHours,
        host
      })
    })
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw error
  }
}

/**
 * Generate HTML email template for magic link
 */
function generateMagicLinkEmail({
  email,
  url,
  token,
  expirationTime,
  expirationHours,
  host
}: {
  email: string
  url: string
  token: string
  expirationTime: Date
  expirationHours: number
  host: string
}): string {
  // Fallback link in case button doesn't work
  const plainTextUrl = url

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #f0f0f0;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #4f46e5;
    }
    .content {
      background-color: white;
      padding: 40px 30px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .description {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    .button {
      display: inline-block;
      background-color: #4f46e5;
      color: white;
      text-decoration: none;
      padding: 14px 40px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #4338ca;
    }
    .code-container {
      background-color: #f3f4f6;
      padding: 20px;
      border-radius: 6px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #1f2937;
      word-break: break-all;
      padding: 10px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #f0f0f0;
      font-size: 12px;
      color: #9ca3af;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #fcd34d;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      font-size: 13px;
      color: #78350f;
    }
    .security-note {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎓 Modeh</div>
    </div>

    <div class="content">
      <div class="greeting">Welcome back to Modeh!</div>
      
      <div class="description">
        Click the button below to securely sign in to your account. This link will expire in <strong>${expirationHours} hours</strong>.
      </div>

      <div class="button-container">
        <a href="${url}" class="button">🔗 Sign In to Modeh</a>
      </div>

      <div class="description" style="text-align: center; color: #9ca3af; margin-top: 30px; margin-bottom: 0;">
        Or copy and paste this link into your browser:
      </div>

      <div class="code-container">
        <div class="code">${plainTextUrl}</div>
      </div>

      <div class="warning">
        ⚠️ <strong>Security Note:</strong> If you didn't request this sign-in link, please ignore this email. This link is only valid for your account and will expire soon.
      </div>

      <div class="security-note">
        <strong>Why are we sending this?</strong> For your security, we use magic links that require no password. Each link is unique and can only be used once.
      </div>
    </div>

    <div class="footer">
      <p>© 2025 Modeh. All rights reserved.</p>
      <p>Sent to: ${email}</p>
      <p style="margin-top: 10px; color: #d1d5db;">
        Link expires at: ${expirationTime.toLocaleString()}
      </p>
    </div>
  </div>
</body>
</html>
`
}
