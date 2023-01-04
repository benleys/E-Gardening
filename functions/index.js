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
//Joi validation
const Joi = require("joi");
const { validateSignup, validateUpdate } = require ("./validator");

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
let filteredUsers = [];

//--------------------ROUTES--------------------
//Root
app.get('/', async(req, res) => {
    // return res.status(200).send("Everything works!");
    //res.sendFile(__dirname + '/public/index.html');
    const usersDocument = await User.get();
    const listOfUsers = usersDocument.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.send(listOfUsers);
});

//Search Specific Users on id
app.get('/:id', async(req, res) => {
    try {
      const userID = User.doc(req.params.id);
      let userDetail = await userID.get();
      let response = userDetail.data();

      return res.status(200).send({ status: "Succes", data: response })
    } catch (error) {
      console.log(error)
      return res.status(500).send({ status: "Failed", data: error })
    }
});

//Search Specific Users on firstname
app.get('/searchUser/:firstname', async(req, res) => {
    const firstname = req.params.firstname;
    // console.log(firstname);
    // const limitResults = await User.orderBy('email').limit(3).get();
    const limitResultsByFirstname = await User.where('firstname', '==', firstname).get();
    limitResultsByFirstname.forEach(doc => {
      // console.log(doc.id, '=>', doc.data());
      filteredUsers.push(doc.id, '=>', doc.data());
    });
    res.json(filteredUsers);
    filteredUsers = [];
});

//Search Specific Users on firstname with ordering on lastname and limit
app.get('/searchUser/:firstname/:limit', async(req, res) => {
  const firstname = req.params.firstname;
  const limit = parseInt(req.params.limit);
  const limitResults = await User.where('firstname', '==', firstname).orderBy('lastname', 'asc').limit(limit).get();
  limitResults.forEach(doc => {
    // console.log(doc.id, '=>', doc.data());
    filteredUsers.push(doc.id, '=>', doc.data());
  });
  res.json(filteredUsers);
  filteredUsers = [];
});

//Get All Users
app.get('/getAllUsers', async(req, res) => {
  const usersDocument = await User.get();
  const listOfUsers = usersDocument.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.send(listOfUsers);
});

//Create User
app.post('/createUser', async(req, res) => {
    const data = validateSignup(req.body)
    await User.add(data.value);
    res.send({ msg: "User added successfully"});
});

//Update Specific User
app.put('/updateUser/:id', async(req, res) => {
    const id = req.params.id;
    // delete req.body.id;
    const data = validateUpdate(req.body);
    await User.doc(id).update(data.value);
    res.send({ msg: "User updated successfully"});
});

//Delete Specific User
app.delete('/deleteUser/:id', async(req, res) => {
    const id = req.params.id;
    await User.doc(id).delete();
    res.send({ msg: "User deleted successfully"});
});

//Exports api to firestore
exports.app = functions.https.onRequest(app);
