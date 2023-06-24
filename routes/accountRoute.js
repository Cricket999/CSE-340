// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require("../utilities/account-validation")

// Route to build account view
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// Route to registration view
router.get("/registration", utilities.handleErrors(accountController.buildRegister));
// Route to process registration data
router.post("/registration",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount));

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
  )

// Account Management Route
router.get("", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Account Update View Route
router.get("/update", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate));

// Account Update Route
router.post("/updateaccount",
    regValidate.accUpdateRules(),
    regValidate.checkAccUpdateData,
    utilities.handleErrors(accountController.updateAccount));

// Password Update Route
    router.post("/updatepassword",
    regValidate.passUpdateRules(),
    regValidate.checkPassUpdateData,
    utilities.handleErrors(accountController.updatePassword));

// Logout Route
    router.get("/logout", utilities.handleErrors(accountController.logout));

module.exports = router;