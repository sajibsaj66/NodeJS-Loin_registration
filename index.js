const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const bodyParser = require('body-parser');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const ACCESS_TOKEN_SECRET = '06863ad78b3405fc85135fb7879b0a17b4c2e44ad987f5b98ab8a355ab36da9e530e4e8a97f204fba767164ce5ddfbc2b64f1a088fea08281857cc65778cc95d';
const uri = `mongodb+srv://menu_mapper:t6y7kFLk6MCEkcpr@cluster0.u0sqh7e.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send({ message: 'unauthorized access' });
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, ACCESS_TOKEN_SECRET, function (err, decoded) {
//         if (err) {
//             return res.status(401).send({ message: 'unauthorized access' });
//         }
//         req.decoded = decoded;
//         next();
//     });
// }

async function run() {
    try {
        const usersCollection = client.db('menu_mapper').collection('users');

        app.post('/register', async (req, res) => {
            const user = req.body;
            const query = { $or: [
                {email: user.email},
                {username : user.username}]};
            const alreadyUser = await usersCollection.findOne(query);
            if (!alreadyUser) {
                const result = await usersCollection.insertOne(user);
                const token = jwt.sign( {username : result.username} , ACCESS_TOKEN_SECRET);
                res.status(200).send(token);
            }
            if (alreadyUser) {
                const token = jwt.sign( {username : alreadyUser.username} , ACCESS_TOKEN_SECRET);
                res.status(200).send(token);
            }
        });

        app.post('/login', async (req, res) => {
            const user = req.body;
            const userQuery = { $and: [
                {username: user.username},
                {password : user.password}]};
            const isUser = await usersCollection.findOne(userQuery);
            if (isUser) {
                const token = jwt.sign( {username : isUser.username} , ACCESS_TOKEN_SECRET);
                res.status(200).send(token);
            }
            else {
                return res.status(404).send('Invalid Login Credentials');
            }
        });

    }
    finally {

    }

}

run().catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello From Node Mongo Server');
})

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})