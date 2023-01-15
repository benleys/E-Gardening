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
const { validateSignup, validateUpdate, validateFeedback, validateUpdateFeedback } = require ("./validator");
//Bcrypt
const bcrypt = require('bcrypt');

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
const Feedback = db.collection('Feedback');
let filteredUsers = [];
let filteredFeedback = [];

//--------------------ROUTES--------------------
//Root
app.get('/', async(req, res) => {
    // return res.status(200).send("Everything works!");
    //res.sendFile(__dirname + '/public/index.html');
    try {
      const usersDocument = await User.get();
      const listOfUsers = usersDocument.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const feedbackDocument = await Feedback.get();
      const listOfFeedback = feedbackDocument.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      return res.status(200).send({ status: "Succes", user_data: listOfUsers, feedback_data: listOfFeedback })
    } catch (error) {
      console.log(error)
      return res.status(500).send({ status: "Failed", data: error })
    }
});

//--------------------USERS--------------------
//Search Specific Users on id
app.get('/userid/:id', async(req, res) => {
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
    try {
      filteredUsers = [];
      const firstnamedata = req.params.firstname;
      const firstname = firstnamedata.charAt(0).toUpperCase() + firstnamedata.slice(1);
      // console.log(firstname);
      const limitResultsByFirstname = await User.where('firstname', '==', firstname).get();
      limitResultsByFirstname.forEach(doc => {
        // console.log(doc.id, '=>', doc.data());
        filteredUsers.push(doc.id, '=>', doc.data());
      });

      return res.status(200).send({ status: "Succes", data: filteredUsers })
    } catch (error) {
      console.log(error)
      return res.status(500).send({ status: "Failed", data: error })
    }
});

//Search Specific Users on firstname and lastname
app.get('/searchUser/:firstname/:lastname', async(req, res) => {
  try {
    filteredUsers = [];
    const firstnamedata = req.params.firstname;
    const firstname = firstnamedata.charAt(0).toUpperCase() + firstnamedata.slice(1);
    const lastnamedata = req.params.lastname;
    const lastname = lastnamedata.charAt(0).toUpperCase() + lastnamedata.slice(1);
    // console.log(firstname);
    const limitResultsByName = await User.where('firstname', '==', firstname).where('lastname', '==', lastname).get();
    limitResultsByName.forEach(doc => {
      // console.log(doc.id, '=>', doc.data());
      filteredUsers.push(doc.id, '=>', doc.data());
    });

    return res.status(200).send({ status: "Succes", data: filteredUsers })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: "Failed", data: error })
  }
});

//Search Specific Users on firstname with ordering on lastname and limit
app.get('/searchLimitUser/:firstname/:limit', async(req, res) => {
  try {
    filteredUsers = [];
    const firstnamedata = req.params.firstname;
    const firstname = firstnamedata.charAt(0).toUpperCase() + firstnamedata.slice(1);
    const limit = parseInt(req.params.limit);
    const limitResults = await User.where('firstname', '==', firstname).orderBy('lastname', 'asc').limit(limit).get();
    limitResults.forEach(doc => {
      // console.log(doc.id, '=>', doc.data());
      filteredUsers.push(doc.id, '=>', doc.data());
    });

    return res.status(200).send({ status: "Succes", data: filteredUsers })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: "Failed", data: error })
  }
});

//Get All Users
app.get('/getAllUsers', async(req, res) => {
  try {
    const usersDocument = await User.get();
    const listOfUsers = usersDocument.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.status(200).send({ status: "Succes", data: listOfUsers })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: "Failed", data: error })
  }
});

//Create User
app.post('/createUser', async(req, res) => {
    try {
      const data = validateSignup(req.body);
      if(data.error){
        return res.status(500).send({ status: "Failed", data: data.error.details })
      }

      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(data.value.password, salt);

      const result = {
        "firstname": data.value.firstname,
        "lastname": data.value.lastname,
        "email": data.value.email,
        "phonenumber": data.value.phonenumber,
        "password": hashPassword,
      }
      // console.log(result);
      await User.add(result);
  
      return res.status(200).send({ status: "User added successfully" })
    } catch (error) {
      console.log(error)
      return res.status(500).send({ status: "Failed", data: error })
    }
});

//Update Specific User
app.put('/updateUser/:id', async(req, res) => {
    try {
      const id = req.params.id;
      const data = validateUpdate(req.body);
      if(data.error){
        return res.status(500).send({ status: "Failed", data: data.error.details })
      }
      // console.log(data);
      await User.doc(id).update(data.value);
  
      return res.status(200).send({ status: "User updated successfully" })
    } catch (error) {
      console.log(error)
      return res.status(500).send({ status: "Failed", data: error })
    }
});

//Delete Specific User
app.delete('/deleteUser/:id', async(req, res) => {
    try {
      const id = req.params.id;
      await User.doc(id).delete();
  
      return res.status(200).send({ status: "User deleted successfully" })
    } catch (error) {
      console.log(error)
      return res.status(500).send({ status: "Failed", data: error })
    }
});

//--------------------FEEDBACK--------------------
//Search Specific Feedback on id
app.get('/feedbackid/:id', async(req, res) => {
  try {
    const feedbackID = Feedback.doc(req.params.id);
    let feedbackDetail = await feedbackID.get();
    let response = feedbackDetail.data();

    return res.status(200).send({ status: "Succes", data: response })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: "Failed", data: error })
  }
});

//Search Specific Feedback on rating
app.get('/searchFeedback/:rating', async(req, res) => {
  try {
    filteredFeedback = [];
    const rating = parseInt(req.params.rating);
    // console.log(title);
    const limitResultsByRating = await Feedback.where('rating', '==', rating).get();
    limitResultsByRating.forEach(doc => {
      // console.log(doc.id, '=>', doc.data());
      filteredFeedback.push(doc.id, '=>', doc.data());
    });

    return res.status(200).send({ status: "Succes", data: filteredFeedback })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: "Failed", data: error })
  }
});

//Search Feedback with rating starting at ... and ending at ... (ordered on rating) 
app.get('/searchFeedback/:start/:end', async(req, res) => {
  try {
    filteredFeedback = [];
    const offset = parseInt(req.params.start);
    const offset2 = parseInt(req.params.end);
    const limitResults = await Feedback.orderBy('rating', 'asc').startAt(offset).endAt(offset2).get();
    limitResults.forEach(doc => {
      // console.log(doc.id, '=>', doc.data());
      filteredFeedback.push(doc.id, '=>', doc.data());
    });

    return res.status(200).send({ status: "Succes", data: filteredFeedback })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: "Failed", data: error })
  }
});

//Get All Feedbacks
app.get('/getAllFeedbacks', async(req, res) => {
  try {
    const feedbacksDocument = await Feedback.get();
    const listOfFeedbacks = feedbacksDocument.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.status(200).send({ status: "Succes", data: listOfFeedbacks })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: "Failed", data: error })
  }
});

//Create Feedback
app.post('/createFeedback', async(req, res) => {
  try {
    const data = validateFeedback(req.body);
    if(data.error){
      return res.status(500).send({ status: "Failed", data: data.error.details })
    }
    // console.log(result);
    await Feedback.add(data.value);

    return res.status(200).send({ status: "Feedback added successfully" })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: "Failed", data: error })
  }
});

//Update Specific Feedback
app.put('/updateFeedback/:feedbackid', async(req, res) => {
  try {
    const feedbackid = req.params.feedbackid;
    const data = validateUpdateFeedback(req.body);
    if(data.error){
      return res.status(500).send({ status: "Failed", data: data.error.details })
    }
    // console.log(data);
    await Feedback.doc(feedbackid).update(data.value);

    return res.status(200).send({ status: "Feedback updated successfully" })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: "Failed", data: error })
  }
});

//Delete Specific Feedback
app.delete('/deleteFeedback/:feedbackid', async(req, res) => {
  try {
    const feedbackid = req.params.feedbackid;
    await Feedback.doc(feedbackid).delete();

    return res.status(200).send({ status: "Feedback deleted successfully" })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: "Failed", data: error })
  }
});

//Exports api to firestore
exports.app = functions.https.onRequest(app);
