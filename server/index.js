const PORT = 8000
const express = require('express')
const { MongoClient } = require('mongodb')
const {v4: uuidv4} = require('uuid')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bcrypt = require('bcrypt')
const WebSocket = require('ws')
require('dotenv').config()


const app = express()
const uri = process.env.URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
let db, messagesCollection;

// Connect to MongoDB
client.connect().then(() => {
    db = client.db('app-data')
    messagesCollection = db.collection('messages')
}).catch(error => console.error('Error connecting to MongoDB:', error))

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json('Hello to my app')
})

app.post('/signup', async (req, res) => {
    console.log('Received signup request with data:', req.body);

    const client = new MongoClient(uri);
    const { email, password } = req.body;

    const generatedUserId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected to database');

        const database = client.db('app-data');
        const users = database.collection('users');

        const existingUser = await users.findOne({ email });
        console.log('Checking if user exists...');

        if (existingUser) {
            console.log('User already exists:', existingUser);
            return res.status(409).send('User already exists. Please log in');
        }

        const sanitizedEmail = email.toLowerCase();

        const data = {
            user_id: generatedUserId,
            email: sanitizedEmail,
            hashed_password: hashedPassword,
        };

        console.log('Inserting new user:', data);
        await users.insertOne(data);

        const token = jwt.sign({ userId: generatedUserId, email: sanitizedEmail }, 'your_jwt_secret', {
            expiresIn: 60 * 24,
        });

        console.log('User created successfully:', data);
        res.status(201).json({ token, userId: generatedUserId
            // , email: sanitizedEmail
        });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send('Error creating user');
    } finally {
        await client.close();
    }
});

app.post('/login', async (req, res) => {
    const client = new MongoClient(uri);
    const { email, password } = req.body;

    try{
       await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const user = await users.findOne({ email });

       const correctPassword = await bcrypt.compare(password, user.hashed_password)

       if (user && correctPassword) {
           const token = jwt.sign(user, email, {
               expiresIn: 60 * 24
           })
           res.status(201).json({token, userId: user.user_id
               // , email
           });
       }
        res.status(400).send('Invalid Credentials');
    } catch (err) {
        console.log(err)
    }
})

app.get('/user', async (req, res) => {
    const client = new MongoClient(uri);
    const userId = req.query.userId

    // console.log('userId', userId)

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const query = { user_id: userId }
        const user = await users.findOne(query)
        res.send(user)
    } finally {
        await client.close()
    }

})

app.get('/users', async (req, res) => {
    const client = new MongoClient(uri);
    const userIds = JSON.parse(req.query.userIds);
    console.log(userIds);

    try{
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const pipeline =
            [
                {
                    '$match': {
                        'user_id': {
                            '$in': userIds
                        }
                    }
                }
            ]
        const foundUsers = await users.aggregate(pipeline).toArray()
        console.log(foundUsers)
        res.send(foundUsers)

    } finally {
        await client.close()
    }
})


app.get('/gendered-users', async (req, res) => {
    const client = new MongoClient(uri)
    const gender = req.query.gender

    // console.log('gender', gender)


    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')
        const query = gender === 'everyone' ? {} : { gender_identity: { $eq: gender } };
        const foundUsers = await users.find(query).toArray()


        res.send(foundUsers)
    } finally {
        await client.close()
    }
})

app.get('/majored-users', async (req, res) => {
    const client = new MongoClient(uri);
    const major = req.query.major;

    // console.log('major', major);

    try {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');
        const query = major === 'everyone' ? {} : { major: { $eq: major } };
        // const query = { major: { $eq: major } }; // Filter by major

        const foundUsers = await users.find(query).toArray();

        res.send(foundUsers);
    } finally {
        await client.close();
    }
});

app.get('/ethnicity-users', async (req, res) => {
    const client = new MongoClient(uri);
    const ethnicity = req.query.ethnicity;

    // console.log('major', major);

    try {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');
        const query = ethnicity === 'everyone' ? {} : { ethnicity: { $eq: ethnicity } };

        // const query = { ethnicity: { $eq: ethnicity } }; // Filter by major

        const foundUsers = await users.find(query).toArray();

        res.send(foundUsers);
    } finally {
        await client.close();
    }
});

app.put('/user', async (req, res) => {
    const client = new MongoClient(uri);
    const formData = req.body.formData;

    try{
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const query = { user_id: formData.user_id }
        const updateDocument = {
            $set: {
                first_name: formData.first_name,
                dob_day: formData.dob_day,
                dob_month: formData.dob_month,
                dob_year: formData.dob_year,
                ethnicity: formData.ethnicity,
                major: formData.major,
                show_gender: formData.show_gender,
                gender_identity: formData.gender_identity,
                gender_interest: formData.gender_interest,
                major_interest: formData.major_interest,
                ethnicity_interest: formData.ethnicity_interest,
                url: formData.url,
                about: formData.about,
                funPrompt1: formData.funPrompt1,
                funPrompt2: formData.funPrompt2,
                funPrompt3: formData.funPrompt3,
                funPrompt4: formData.funPrompt4,
                matches: formData.matches

            },
        }
        const insertedUser = await users.updateOne(query, updateDocument);
        res.send(insertedUser)
    } finally {
        await client.close()
    }
})

app.put('/addmatch', async (req, res) => {
    const client = new MongoClient(uri)
    const { userId, matchedUserId} =req.body

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const query = { user_id: userId }
        const updateDocument = {
            $push: { matches: {user_id: matchedUserId}},
        }
        const user = await users.updateOne(query, updateDocument)
        res.send(user)
    } finally {
        await client.close()
    }
})

app.get('/messages', async (req, res) => {
    const client = new MongoClient(uri)
    const { userId, correspondingUserId} = req.query
    console.log(userId, correspondingUserId)

    try {
        await client.connect()
        const database = client.db('app-data')
        const messages = database.collection('messages')

        const query = {
            from_userId: userId, to_userId:correspondingUserId
        }
        const foundMessages = await messages.find(query).toArray()
        res.send(foundMessages)
    } finally {
        await client.close()
    }
})

app.post('/message', async (req, res) => {
    const client = new MongoClient(uri)
    const message = req.body.message

    try {
        await client.connect()
        const database = client.db('app-data')
        const messages = database.collection('messages')

        const insertedMessage = await messages.insertOne(message)
        res.send(insertedMessage)
    } finally {
        await client.close()
    }
})

// WebSocket server setup
const wss = new WebSocket.Server({ noServer: true })

// Function to broadcast the message to all connected clients
function broadcastMessage(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))  // Send message to all clients
        }
    })
}

wss.on('connection', (ws) => {
    console.log('A new client connected')

    // Send all previous messages to the new client
    messagesCollection.find().toArray().then(messages => {
        ws.send(JSON.stringify(messages))  // Send all messages on new connection
    })

    ws.on('message', (message) => {
        console.log('Received message:', message)

        // Save incoming message to the database
        const parsedMessage = JSON.parse(message)
        messagesCollection.insertOne(parsedMessage)
            .then(() => {
                // Broadcast the new message to all clients
                broadcastMessage(parsedMessage)
            })
            .catch(err => console.error('Error saving message:', err))
    })

    ws.on('close', () => {
        console.log('Client disconnected')
    })
})

// WebSocket upgrade handler
app.server = app.listen(PORT, () => {
    console.log('Server running on PORT ' + PORT)
})

app.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
    })
})

