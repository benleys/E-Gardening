//--------------------IMPORTS--------------------
//Firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
//Express
const express = require("express");
//Cors
const cors = require("cors");

//--------------------MAIN APP--------------------
const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended:true
}));
//app.use(express.static('public'));
app.use(cors({ origin: true }));

//--------------------INIT--------------------
const db = admin.firestore();
const User = db.collection('Users');

//--------------------ROUTES--------------------
//Root
app.get('/', async(req, res) => {
    //return res.status(200).send("Everything works!");
    //res.sendFile(__dirname + '/public/index.html');
    const snapshot = await User.get();
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.send(list);
});

//Create User
app.post('/createUser', async(req, res) => {
    const data = req.body;
    await User.add(data);
    res.send({ msg: "User added successfully"});
});

//Update Specific User
app.put('/updateUser', async(req, res) => {
    const id = req.body.id;
    delete req.body.id;
    const data = req.body;
    await User.doc(id).update(data);
    res.send({ msg: "User updated successfully"});
});

//Delete Specific User
app.delete('/deleteUser', async(req, res) => {
    const id = req.body.id;
    await User.doc(id).delete();
    res.send({ msg: "User deleted successfully"});
});

//Exports api to firestore
exports.app = functions.https.onRequest(app);
