const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// ============================================
// EMAIL KONFIGURATION (mit Environment Variables)
// ============================================
// Gmail-Credentials werden als Firebase Config gespeichert, NICHT im Code!
// 
// Zum Setzen:
// firebase functions:config:set gmail.email="antrhizom@gmail.com" gmail.password="dein-app-passwort"
// firebase deploy --only functions

const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: functions.config().gmail?.email || process.env.GMAIL_EMAIL || 'antrhizom@gmail.com',
    pass: functions.config().gmail?.password || process.env.GMAIL_PASSWORD || ''
  }
};

const ADMIN_EMAIL = functions.config().gmail?.email || process.env.GMAIL_EMAIL || 'antrhizom@gmail.com';

// Warnung wenn Passwort fehlt
if (!EMAIL_CONFIG.auth.pass) {
  console.warn('⚠️ WARNUNG: Gmail App-Passwort nicht konfiguriert!');
  console.warn('Setze mit: firebase functions:config:set gmail.password="dein-app-passwort"');
}

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// ============================================
// FIREBASE FUNCTION: E-Mail bei Löschanfrage
// ============================================

exports.sendDeletionRequestEmail = functions.firestore
  .document('prompts/{promptId}')
  .onUpdate(async (change, context) => {
    try {
      const newData = change.after.data();
      const oldData = change.before.data();
      const promptId = context.params.promptId;

      const oldRequests = oldData.deletionRequests || [];
      const newRequests = newData.deletionRequests || [];

      if (newRequests.length <= oldRequests.length) {
        return null;
      }

      const latestRequest = newRequests[newRequests.length - 1];

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
    .warning { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .prompt-text { background: #f3f4f6; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; word-wrap: break-word; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 0.9em; margin-top: 30px; }
    .meta { color: #6b7280; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🚨 Neue Löschanfrage</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${newData.titel || 'Ohne Titel'}</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2 style="margin-top: 0; color: #667eea;">📋 Prompt-Details</h2>
        <p><strong>Titel:</strong> ${newData.titel || 'Ohne Titel'}</p>
        <p><strong>Prompt-ID:</strong> <code>${promptId}</code></p>
        <p><strong>Plattformen:</strong> ${Object.keys(newData.plattformenUndModelle || {}).join(', ')}</p>
        <p><strong>Erstellt von:</strong> ${newData.erstelltVon || 'Unbekannt'} ${newData.erstelltVonRolle ? `(${newData.erstelltVonRolle})` : ''}</p>
        <p><strong>Nutzungen:</strong> ${newData.nutzungsanzahl || 0}×</p>
        <p class="meta"><strong>Anzahl Meldungen:</strong> ${newRequests.length}</p>
      </div>

      <div class="section">
        <h2 style="margin-top: 0; color: #667eea;">💬 Prompt-Text</h2>
        <div class="prompt-text">${(newData.promptText || '').substring(0, 300)}${(newData.promptText || '').length > 300 ? '...' : ''}</div>
      </div>

      <div class="warning">
        <h2 style="margin-top: 0; color: #f59e0b;">⚠️ Grund der Meldung</h2>
        <p><strong>Gemeldet von:</strong> ${latestRequest.userName || 'Anonym'} (${latestRequest.userCode || 'Unbekannt'})</p>
        <p><strong>Grund:</strong> ${latestRequest.grund || 'Kein Grund angegeben'}</p>
        <p class="meta"><strong>Zeit:</strong> ${latestRequest.timestamp || 'Unbekannt'}</p>
      </div>

      ${newData.tags && newData.tags.length > 0 ? `
      <div class="section">
        <p><strong>🏷️ Tags:</strong> ${newData.tags.join(', ')}</p>
      </div>
      ` : ''}

      <div style="text-align: center;">
        <a href="https://prompt-managerin.vercel.app" class="button">🔗 Zur App</a>
      </div>
    </div>

    <div class="footer">
      <p>Diese E-Mail wurde automatisch generiert von Prompt Manager</p>
      <p>Firebase Functions • ${new Date().toLocaleDateString('de-DE')}</p>
    </div>
  </div>
</body>
</html>
      `;

      await transporter.sendMail({
        from: `Prompt Manager <${EMAIL_CONFIG.auth.user}>`,
        to: ADMIN_EMAIL,
        subject: `🚨 Neue Löschanfrage: ${newData.titel || 'Ohne Titel'}`,
        html: emailHtml
      });

      console.log(`✅ Löschanfrage-Email erfolgreich gesendet für Prompt ${promptId}`);
      return null;

    } catch (error) {
      console.error('❌ Fehler beim Senden der Löschanfrage-Email:', error);
      return null;
    }
  });
