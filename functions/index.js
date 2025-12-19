const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// ============================================
// EMAIL KONFIGURATION
// ============================================
// WICHTIG: Ersetze diese Werte mit deinen Gmail-Daten!
// Siehe FIREBASE_FUNCTIONS_SETUP.md für Gmail App-Passwort Setup

const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'deine-email@gmail.com',  // <-- HIER DEINE GMAIL-ADRESSE
    pass: 'xxxx xxxx xxxx xxxx'      // <-- HIER DEIN APP-PASSWORT (16 Zeichen)
  }
};

const ADMIN_EMAIL = 'admin@deine-schule.de'; // <-- HIER ADMIN-EMAIL

// Email Transporter erstellen
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// ============================================
// FUNCTION 1: Löschanfrage-Benachrichtigung
// ============================================
// Wird ausgelöst wenn ein Prompt aktualisiert wird
exports.sendDeletionRequestEmail = functions.firestore
  .document('prompts/{promptId}')
  .onUpdate(async (change, context) => {
    try {
      const newData = change.after.data();
      const oldData = change.before.data();
      
      // Check ob neue Löschanfrage hinzugekommen ist
      const newRequests = newData.deletionRequests || [];
      const oldRequests = oldData.deletionRequests || [];
      
      if (newRequests.length > oldRequests.length) {
        const promptId = context.params.promptId;
        const promptText = newData.text.substring(0, 200);
        const category = newData.category;
        
        // Email Inhalt
        const mailOptions = {
          from: `Prompt Manager <${EMAIL_CONFIG.auth.user}>`,
          to: ADMIN_EMAIL,
          subject: '⚠️ Neue Löschanfrage für Prompt',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .prompt-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
                .info-row { display: flex; margin: 10px 0; }
                .info-label { font-weight: bold; min-width: 150px; }
                .button { background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
                .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
                .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🚨 Neue Löschanfrage</h1>
                  <p style="margin: 10px 0 0 0;">Ein Nutzer hat die Löschung eines Prompts beantragt</p>
                </div>
                
                <div class="content">
                  <div class="warning">
                    <strong>⚠️ Aktion erforderlich:</strong> Bitte prüfen Sie diese Löschanfrage und entscheiden Sie über die Genehmigung.
                  </div>
                  
                  <h2>Prompt-Details:</h2>
                  
                  <div class="info-row">
                    <span class="info-label">Prompt-ID:</span>
                    <span>${promptId}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Kategorie:</span>
                    <span><strong>${category}</strong></span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Erstellt von:</span>
                    <span>${newData.userName}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Nutzungen:</span>
                    <span>${newData.usageCount}×</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Bewertungen:</span>
                    <span>${Object.values(newData.rating || {}).reduce((a, b) => a + b, 0)}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Anzahl Anfragen:</span>
                    <span style="color: #ef4444; font-weight: bold;">${newRequests.length}</span>
                  </div>
                  
                  <div class="prompt-box">
                    <h3 style="margin-top: 0;">Prompt-Text:</h3>
                    <p style="white-space: pre-wrap;">${promptText}${newData.text.length > 200 ? '...' : ''}</p>
                  </div>
                  
                  ${newData.tags && newData.tags.length > 0 ? `
                    <div class="info-row">
                      <span class="info-label">Tags:</span>
                      <span>${newData.tags.join(', ')}</span>
                    </div>
                  ` : ''}
                  
                  <a href="https://prompt-managerin.vercel.app" class="button">
                    🔗 Zur App (Löschen oder Ablehnen)
                  </a>
                </div>
                
                <div class="footer">
                  <p>Diese Email wurde automatisch vom Prompt Manager System generiert.</p>
                  <p>Bitte nicht auf diese Email antworten.</p>
                </div>
              </div>
            </body>
            </html>
          `
        };
        
        // Email senden
        await transporter.sendMail(mailOptions);
        console.log(`✅ Löschanfrage-Email erfolgreich gesendet für Prompt ${promptId}`);
        
        return { success: true };
      }
      
      return { success: false, reason: 'Keine neue Löschanfrage' };
      
    } catch (error) {
      console.error('❌ Fehler beim Email-Versand:', error);
      // Fehler nicht werfen, damit die Firestore-Operation nicht fehlschlägt
      return { success: false, error: error.message };
    }
  });

// ============================================
// FUNCTION 2: Täglicher Report (Optional)
// ============================================
// Sendet jeden Tag um 9 Uhr einen Report über alle ausstehenden Löschanfragen
// Kann mit: firebase deploy --only functions:sendDailyDeletionReport deployed werden

exports.sendDailyDeletionReport = functions.pubsub
  .schedule('0 9 * * *') // Jeden Tag um 9:00 Uhr
  .timeZone('Europe/Berlin')
  .onRun(async (context) => {
    try {
      const snapshot = await admin.firestore()
        .collection('prompts')
        .where('deletionRequests', '!=', [])
        .get();
      
      if (snapshot.empty) {
        console.log('✅ Keine ausstehenden Löschanfragen für täglichen Report');
        return null;
      }
      
      // HTML für Report erstellen
      let promptsList = '';
      let totalRequests = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        totalRequests += data.deletionRequests.length;
        
        promptsList += `
          <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ef4444;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong style="color: #7c3aed;">${data.category}</strong>
              <span style="color: #ef4444; font-weight: bold;">${data.deletionRequests.length} Anfrage(n)</span>
            </div>
            <p style="margin: 5px 0;">${data.text.substring(0, 150)}${data.text.length > 150 ? '...' : ''}</p>
            <div style="font-size: 12px; color: #6b7280; margin-top: 10px;">
              Erstellt von: <strong>${data.userName}</strong> | 
              Nutzungen: ${data.usageCount}× | 
              Tags: ${data.tags.join(', ')}
            </div>
          </div>
        `;
      });
      
      const mailOptions = {
        from: `Prompt Manager <${EMAIL_CONFIG.auth.user}>`,
        to: ADMIN_EMAIL,
        subject: `📊 Täglicher Löschanfragen-Report (${snapshot.size} Prompts, ${totalRequests} Anfragen)`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; }
              .stats { display: flex; justify-content: space-around; margin: 20px 0; }
              .stat-box { text-align: center; background: white; padding: 20px; border-radius: 8px; flex: 1; margin: 0 10px; }
              .stat-number { font-size: 36px; font-weight: bold; color: #3b82f6; }
              .button { background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">📊 Täglicher Report</h1>
                <p style="margin: 10px 0 0 0;">${new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              
              <div class="content">
                <div class="stats">
                  <div class="stat-box">
                    <div class="stat-number">${snapshot.size}</div>
                    <div>Prompts mit Anfragen</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-number">${totalRequests}</div>
                    <div>Gesamt-Anfragen</div>
                  </div>
                </div>
                
                <h2>Ausstehende Löschanfragen:</h2>
                ${promptsList}
                
                <div style="text-align: center;">
                  <a href="https://prompt-managerin.vercel.app" class="button">
                    🔗 Zur App
                  </a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`✅ Täglicher Report gesendet: ${snapshot.size} Prompts mit ${totalRequests} Anfragen`);
      
      return null;
      
    } catch (error) {
      console.error('❌ Fehler beim Senden des täglichen Reports:', error);
      return null;
    }
  });
