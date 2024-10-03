/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
admin.initializeApp();


/*
exports.getTotalAnswers = functions.https.onRequest(async (req, res) => {
  try {
    const userRef = admin.firestore().doc("users/t4wpkMys9DgF3IC04JIHvYJIFgp1"); // Update to use a reference

    // Step 1: Fetch user data from the users collection
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send("User not found.");
    }

    const userData = userDoc.data();
    const displayName = userData.display_name;

    // Step 2: Query all documents in the Tests collection
    const testsSnapshot = await admin.firestore().collection("Tests").get();

    if (testsSnapshot.empty) {
      return res.status(404).send("No tests found.");
    }

    // Step 3: Query the UserTests collection
    const userTestsSnapshot = await admin.firestore().collection("UserTests")
        .where("user", "==", userRef)
        .limit(1)
        .get();

    if (userTestsSnapshot.empty) {
      return res.status(404).send("No user tests found.");
    }

    const userTestDoc = userTestsSnapshot.docs[0].data();
    const userAnswers = userTestDoc.questions;

    // Step 4: Create an object to store the scores and user display name
    const result = {display_name: displayName};

    // Step 5: Create a mapping for the stages
    const stageNames = {
      1: "ICH Zustände",
      2: "Lebensgrundeinstellungen",
      3: "Lebensskript",
      4: "Antreiber",
      5: "Drama Dreieck",
    };

    // Step 6: Iterate through the tests and calculate scores for each stage and title
    testsSnapshot.forEach((testDoc) => {
      const testData = testDoc.data();
      const stage = stageNames[testData.stage] || `stage_${testData.stage}`; // Fallback to default if not in mapping
      const title = `${testData.title}`;
      const questionNumbers = testData.questions;

      // Initialize the stage object if it doesn't exist
      if (!result[stage]) {
        result[stage] = {};
      }

      // Calculate the total score for the current test
      let totalSum = 0;
      for (const questionNumber of questionNumbers) {
        const userAnswer = userAnswers.find((q) => q.Question === questionNumber);
        if (userAnswer) {
          totalSum += userAnswer.answer;
        }
      }

      // Store the score for the current test's title
      result[stage][title] = totalSum;
    });

    // Step 7: Send the result to the provided URL
    const apiUrl = "https://hook.eu2.make.com/by78rgaglbss4dmd2mhluegd2riyy5bk";
    const headers = {
      "Content-Type": "application/json",
    };

    // Step 8: Make the POST request to the API with the result as the body
    await axios.post(apiUrl, result, {headers});

    // Step 9: Send a response back to the caller
    return res.status(200).send("Data successfully sent to the API");
  } catch (error) {
    console.error("Error fetching data or sending to API:", error);
    return res.status(500).send("Internal server error.");
  }
});

*/

exports.onUserTestCreate = functions.region("europe-west3").firestore
    .document("UserTests/{userTestId}")
    .onCreate(async (snap, context) => {
      try {
        const userTestData = snap.data();
        const userRef = userTestData.user; // Assuming `user` is a reference in the `UserTests` document

        // Step 1: Fetch user data from the users collection
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          console.error("User not found.");
          return;
        }

        const userData = userDoc.data();
        const displayName = userData.display_name;

        // Step 2: Query all documents in the Tests collection
        const testsSnapshot = await admin.firestore().collection("Tests").get();

        if (testsSnapshot.empty) {
          console.error("No tests found.");
          return;
        }

        const userAnswers = userTestData.questions;

        // Step 3: Create an object to store the scores and user display name
        const result = {display_name: displayName};

        // Step 4: Create a mapping for the stages
        const stageNames = {
          1: "ICH Zustände",
          2: "Lebensgrundeinstellungen",
          3: "Lebensskript",
          4: "Antreiber",
          5: "Drama Dreieck",
        };

        // Step 5: Iterate through the tests and calculate scores for each stage and title
        testsSnapshot.forEach((testDoc) => {
          const testData = testDoc.data();
          const stage = stageNames[testData.stage] || `stage_${testData.stage}`; // Fallback to default if not in mapping
          const title = `${testData.title}`;
          const questionNumbers = testData.questions;

          // Initialize the stage object if it doesn't exist
          if (!result[stage]) {
            result[stage] = {};
          }

          // Calculate the total score for the current test
          let totalSum = 0;
          for (const questionNumber of questionNumbers) {
            const userAnswer = userAnswers.find((q) => q.Question === questionNumber);
            if (userAnswer) {
              totalSum += userAnswer.answer;
            }
          }

          // Store the score for the current test's title
          result[stage][title] = totalSum;
        });

        // Step 6: Send the result to the provided URL
        const apiUrl = "https://hook.eu2.make.com/azcxsh8g9r8rdl57bx8kfccxy81mpygj";
        const headers = {
          "Content-Type": "application/json",
        };

        // Step 7: Make the POST request to the API with the result as the body
        await axios.post(apiUrl, result, {headers});

        console.log("Data successfully sent to the API");
      } catch (error) {
        console.error("Error fetching data or sending to API:", error);
      }
    });
