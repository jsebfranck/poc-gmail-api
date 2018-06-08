const functions = require('firebase-functions');
const express = require('express');
const {google} = require('googleapis');
const config = require('./config');

const app = express();

app.get('/gmail/auth', (req, res) => {
  const userId = req.query.userId || 'unknown';
  const redirectUrl = config.gmail.redirectBaseUrl + userId;
  const oAuth2Client = new google.auth.OAuth2(config.gmail.client_id, config.gmail.client_secret, redirectUrl);
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'online',
    scope: config.gmail.scopes,
  });
  res.redirect(authUrl);
});

app.get('/gmail/connected', (req, res) => {
  const userId = req.query.userId || 'unknown';
  const code = req.query.code;

  const redirectUrl = config.gmail.redirectBaseUrl + userId;
  const auth = new google.auth.OAuth2(config.gmail.client_id, config.gmail.client_secret, redirectUrl);
  auth.getToken(code, (err, token) => {
    if (err) res.json({err});
    auth.setCredentials(token);

    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.threads.list({
      userId: 'me',
    }, (err, {data}) => {
      if (err) res.json({err});
      res.json(data);
    });
  });
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.app = functions.https.onRequest(app);
