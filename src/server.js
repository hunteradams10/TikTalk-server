const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const {databaseConnector} = require('./database')
const firebaseClient = require("firebase/app")

// https stuff
const fs = require('fs');
const http = require('http');
const https = require('https');

// read key-values from .env file and set them as environment variables
// get the environment variable NODE_ENV. This tells us which environment
// we are in

// if there is no environment defines then we set development as our default
console.log("Using environment variables in " + ".env." + process.env.NODE_ENV)
require('dotenv').config({ path: ".env." + process.env.NODE_ENV })

let httpsServer
// Certificate
if (process.env.USE_HTTPS == "true") {
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/tiktalk-server.codergirlsu.dev/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/tiktalk-server.codergirlsu.dev/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/tiktalk-server.codergirlsu.dev/chain.pem', 'utf8');

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    httpsServer = https.createServer(credentials, app);
} 

// Starting both http & https servers
const httpServer = http.createServer(app);

// catches any unhandled rejections(which are failed promises)
void process.on('unhandledRejection', (reason, p) => {
    console.log(`Things got pretty major here! Big error:\n`+ p);
    console.log(`That error happened because of:\n` + reason);
});

// Use the helmet library to protect the code
app.use(helmet())
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.referrerPolicy())
app.use(helmet.contentSecurityPolicy({
    directives:{
        defaultSrc:["self"]
    }
}))

// configure express receiving & sending in JSON format
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// configure cors and use it
// var corsOptions = {
//     origin:["http://localhost:3000", "http://netlify.blah"],
//     optionsSuccessStatus: 200
// }
app.use(cors())


const firebaseAdmin = require('firebase-admin')
firebaseAdmin.initializeApp({
    credential:firebaseAdmin.credential.cert({
        "projectId":process.env.FIREBASE_ADMIN_PROJECT_ID,
        "privateKey":process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "clientEmail":process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    })
})

firebaseClient.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY
})


const DATABASE_URI = process.env.DATABASE_URI
databaseConnector(DATABASE_URI).then(()=>{
}).catch(error=>{
    console.log(`some error occurred , it was${error}`)
})

// ------------------- Routes-------------------------

const importedUserRouting = require('./Users/UserRoutes')
app.use('/users', importedUserRouting)

const importedMessageRouting = require('./Messages/MessageRoutes')
app.use('/messages', importedMessageRouting)

const importedGroupRouting = require('./Groups/GroupRoutes')
app.use('/groups',importedGroupRouting)


module.exports = {
    httpServer, httpsServer, app
}