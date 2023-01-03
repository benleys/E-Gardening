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
let users = [];

//--------------------ROUTES--------------------
//Root
app.get('/', async(req, res) => {
    // return res.status(200).send("Everything works!");
    //res.sendFile(__dirname + '/public/index.html');
    // const snapshot = await User.get();
    // const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // res.send(list);
    User.get().then(querySnapshot => {
      // console.log(`Found ${querySnapshot.size} documents.`);
      querySnapshot.forEach(doc => {
          const userDetails = doc.data();
          users.push(userDetails);
      });
  
      // The array is filled with users
      // console.log(users.length);
      res.json(users);
      users = [];
    });
});

app.get('/:id', async(req, res) => {
    try {
      const reqDoc = User.doc(req.params.id);
      let userDetail = await reqDoc.get();
      let response = userDetail.data();

      return res.status(200).send({ status: "Succes", data: response })
    } catch (error) {
      console.log(error)
      return res.status(500).send({ status: "Failed", data: err })
    }
});

app.get('/searchUser/:firstname', async(req, res) => {
    const firstname = req.params.firstname;
    console.log(firstname);
    const stateQueryRes = await User.where('email', '==', 'Bert').get();
    console.log(stateQueryRes);
    res.send(stateQueryRes);
});

//Create User
app.post('/createUser', async(req, res) => {
    const data = validateSignup(req.body)
    await User.add(data.value);
    res.send({ msg: "User added successfully"});
});

//Update Specific User
app.put('/updateUser', async(req, res) => {
    const id = req.body.id;
    delete req.body.id;
    const data = validateUpdate(req.body);
    await User.doc(id).update(data.value);
    res.send({ msg: "User updated successfully"});
});

//Delete Specific User
app.delete('/deleteUser', async(req, res) => {
    const id = req.body.id;
    await User.doc(id).delete();
    res.send({ msg: "User deleted successfully"});
});

//Get All Users
app.get('/getAll', async(req, res) => {
  User.get().then(querySnapshot => {
    // console.log(`Found ${querySnapshot.size} documents.`);
    querySnapshot.forEach(doc => {
        const userDetails = doc.data();
        users.push(userDetails);
    });

    // The array is filled with users
    // console.log(users.length);
    res.json(users);
    users = [];
  });
});
//Exports api to firestore
exports.app = functions.https.onRequest(app);
