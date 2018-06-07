
const express = require('express');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const REDIRECT_BASE_URL = 'http://localhost:3000/connected?userId=';

const credentials = JSON.parse(fs.readFileSync('client_secret.json'));
const {client_secret, client_id, redirect_uris} = credentials.installed;

const app = express();

app.use('/', express.static('public'));

app.get('/auth', (req, res) => {
  const userId = req.query.userId || 'unknown';
  const redirectUrl = REDIRECT_BASE_URL + userId;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUrl);
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get('/connected', (req, res) => {
  const userId = req.query.userId || 'unknown';
  const code = req.query.code;

  const redirectUrl = REDIRECT_BASE_URL + userId;
  const auth = new google.auth.OAuth2(client_id, client_secret, redirectUrl);
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

app.listen(3000, () => {
  console.log('started');
});
