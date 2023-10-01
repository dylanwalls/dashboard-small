const express = require('express');
const path = require('path');
const basicAuth = require('basic-auth');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const users = {
  'dylan.walls@bitprop.com': 'bitprop2023',
  'brittany.newton@bitprop.com': 'bitprop2023',
  'buhle.gqola@bitprop.com': 'bitprop2023',
  'jon.fisher@bitprop.com': 'bitprop2023',
};

// Middleware for basic authentication
const basicAuthMiddleware = (req, res, next) => {
  const user = basicAuth(req);

  if (!user || !users[user.name] || users[user.name] !== user.pass) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.status(401).send('Authentication required.');
  }

  // Authentication successful, continue to the next middleware or route
  next();
};

app.use(basicAuthMiddleware);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file when the root path is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
