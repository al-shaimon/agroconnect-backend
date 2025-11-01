# Email Provider Configuration Guide

## Gmail (Recommended)

### Setup Steps:

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy the 16-character password

### Configuration:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password  # No spaces!
```

**Important:** Use the App Password, NOT your regular Gmail password!

---

## Outlook/Hotmail

### Configuration:

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

---

## Yahoo Mail

### Setup Steps:

1. Enable "Allow apps that use less secure sign in"
2. Or generate App Password in Account Security

### Configuration:

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

---

## ProtonMail Bridge

### Configuration:

```env
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_USER=your-email@protonmail.com
SMTP_PASS=your-bridge-password
```

---

## SendGrid (Production Recommended)

### Setup Steps:

1. Sign up at https://sendgrid.com
2. Create API Key in Settings > API Keys

### Configuration:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

---

## Mailgun (Production Alternative)

### Setup Steps:

1. Sign up at https://mailgun.com
2. Get SMTP credentials from Domain Settings

### Configuration:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

---

## Testing Email Service

After configuration, restart the backend:

```bash
npm run dev
```

Look for:

```
✅ Email service ready
```

If you see an error, check:

1. Username and password are correct
2. No extra spaces in credentials
3. App Password is used (for Gmail)
4. 2FA is enabled (for Gmail)

---

## Temporary Disable Email

To disable email notifications while keeping other features:

```env
# Comment out SMTP variables
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASS=
```

The app will still work with:

- ✅ In-app notifications
- ✅ Real-time Socket.IO notifications
- ❌ Email notifications (disabled)
