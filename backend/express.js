const jwt = require('jsonwebtoken');
const express = require('express');
const path = require('path');
const cors = require('cors');
const { log } = require('console');
const app = express();
const JWT_SECRET = 'vader';

app.use(cors());
app.use(express.json());

const users = [];

app.post('/signup', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    users.push({
        username: username,
        password: password
    })
    console.log("User signed up:", { username });//debugging

    res.json({
        message: 'signed up'
    })

});

app.post('/signin', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = users.find(user => user.username == username && user.password == password);

    if (user) {
        const token = jwt.sign(user.username, JWT_SECRET);

        res.json({
            token: token
        });
    }
    else {
        res.status(401).json({
            message: 'Invalid username or password'
        });
    }
});

function auth(req, res, next) {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decodedData = jwt.verify(token, JWT_SECRET);
        req.username = decodedData;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

app.get('/me', auth, (req, res) => {//isme header me info aayega by userinfo fxn in index.html
    const user = users.find(u => u.username == req.username);

    if (!user) {
        return res.status(404).json({ message: "User not found. They may have been deleted or the server restarted." });
    }
    res.json({
        username: user.username,
        password: user.password
    })

});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
