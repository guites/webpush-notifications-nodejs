require('dotenv').config();
const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
// loads scheduling package
// const schedule = require('node-schedule');
// const job = schedule.scheduleJob('*/1 * * * *', function(){
//     console.log('The answer to life, the universe, and everything!');
// });


// ssl certificate
const fs = require('fs');
const key = fs.readFileSync(path.join(__dirname, 'cert', 'key.pem'));
const cert = fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'));
const https = require('https');
// initiates express
const app = express();
const server = https.createServer({key: key, cert: cert}, app);

// Accesses database modules
const database = require('./db/db');
const User = require('./db/user');
// starts sqlite3 database
(async () => {
    const dbSync = await database.sync();
})();



// Serve static file for frontend
app.use(express.static(path.join(__dirname)));

// adds the body parser middleware
app.use(bodyParser.json());

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails('mailto:test@test.com', vapidKeys.publicKey, vapidKeys.privateKey);

// Subscribe Route
app.post('/subscribe', async (req, res) => {
    // Get pushSubscription object
    const subscription = req.body;
    
    try {
        const createUser = await User.findOrCreate({
            where: {
                endpoint: subscription.endpoint,
            },
            defaults: {
                endpoint: subscription.endpoint,
                expirationTime: subscription.expirationTime ? subscription.expirationTime : null,
                keys_auth: subscription.keys.auth,
                keys_p256dh: subscription.keys.p256dh
            }
        });
        // Send 201 - resource created
        res.status(201).json({});
    } catch (error) {
        return res.status(500).json({ error });
    }
    // Create payload
    const payload = JSON.stringify(
        {
            title: 'You subscribed!',
            body: 'Don\'t worry. You will be the one to control these messages!'
        }
    );
    // Pass object into sendNotification
    webpush.sendNotification(subscription, payload).catch(err => console.error(err));
});

// Unsubscribe Route
app.post('/unsubscribe', async (req, res) => {
     // Get pushSubscription object
     const subscription = req.body;
     try {
        await User.destroy({
            where: {
                endpoint: subscription.endpoint
            }
        });
        return res.status(204).json({});
     } catch (error) {
        return res.status(500).json({ error });
     }
});

app.get('/subscriptions', async (req, res) => {
    // Query subscriptions from database
    try {
        const users = await User.findAll();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error });
    }
});

app.post('/messages/:id', async (req, res) => {
    const userId = req.params.id;
    const message = req.body.message;
    try {
        const user = await User.findByPk(userId);

        // returns 404 if user is not found in database
        if (!user) return res.status(404).json({});

        // returns 400 bad request if message text isnt present
        if (!message) return res.status(400).json({});
        // Create payload
        const payload = JSON.stringify(
            {
                title: 'New message!',
                body: message
            }
        );

        // format user object into expected subscription object
        const userSubscription = {
            "endpoint": user.endpoint,
            "expirationTime": user.expirationTime || null,
            "keys": {
              "auth": user.keys_auth,
              "p256dh": user.keys_p256dh
            }
        };

        // Pass object into sendNotification
        webpush.sendNotification(userSubscription, payload).catch(err => console.error(err));
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ hot: 'damn' });
    }
});

const sslPort = 3443;

server.listen(sslPort, () => console.log(`Server started on port ${sslPort}`));