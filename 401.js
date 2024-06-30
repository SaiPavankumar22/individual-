const express = require('express');
const app = express();
const port = 3000;
const fallbackPort = 3001;

app.set('view engine', 'ejs');

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./json.json');
initializeApp({
    credential: cert(serviceAccount),
});
const db = getFirestore();

app.get('/', (req, res) => {
    res.render('main');
});
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signinsubmit', (req, res) => {
    const email_id = req.query.email_id;
    const password = req.query.password;

    db.collection('data')
        .where('email', '==', email_id)
        .where('password', '==', password)
        .get()
        .then((docs) => {
            if (docs.size > 0) {
                res.render('aft_login');
            } else {
                res.send('wrong credentials');
            }
        });
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/signupsubmit', (req, res) => {
    const full_name = req.query.full_name;
    const email_id = req.query.email_id;
    const password = req.query.password;
    db.collection('data')
        .add({
            full_name: full_name,
            email: email_id,
            password: password,
        })
        .then(() => {
            res.render('aft_login');
        });
});

const startServer = (port) => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is already in use, trying port ${fallbackPort}`);
            startServer(fallbackPort);
        } else {
            console.error(err);
        }
    });
};

startServer(port);
