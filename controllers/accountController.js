const accountModel = require("../models/account-model")
const messageModel = require("../models/message-model")
const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let tools = res.locals.tools
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      tools,
      nav,
      errors: null,
    })
  }

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let tools = res.locals.tools
    let nav = await utilities.getNav()
    res.render("account/registration", {
      title: "Register",
      tools,
      nav,
      errors: null,
    })
  }

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let unreadmessages = await messageModel.getUnreadMessageCount(res.locals.userdata.account_id)
  if (unreadmessages == 1) {
    unreadmessages += ' unread message.'
  } else {
    unreadmessages += ' unread messages.'
  }
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  let userwelcome = await utilities.buildUserWelcome(res.locals.userdata,unreadmessages)
  res.render("account/account-management", {
    title: "Account Management",
    tools,
    nav,
    userwelcome,
    errors: null,
  })
}
  
/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let tools = res.locals.tools
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      tools,
      nav,
      errors: null,
    })
  }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        tools,
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/registration", {
        title: "Registration",
        tools,
        nav,
        errors: null,
      })
    }
  }

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    tools,
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
   res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
   return res.redirect("/account")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
  let tools = res.locals.tools
  let account_id = res.locals.userdata.account_id
  let account_firstname = res.locals.userdata.account_firstname
  let account_lastname = res.locals.userdata.account_lastname
  let account_email = res.locals.userdata.account_email
  let nav = await utilities.getNav()
  res.render("account/update", {
    title: "Update Account Details",
    tools,
    nav,
    errors: null,
    account_id,
    account_firstname,
    account_lastname,
    account_email
  })
}

/* ****************************************
*  Process Account Update
* *************************************** */
async function updateAccount(req, res) {
  let tools = res.locals.tools
  let account_id = res.locals.userdata.account_id
    let nav = await utilities.getNav()
    let userwelcome = await utilities.buildUserWelcome(res.locals.userdata)
    const { account_firstname, account_lastname, account_email } = req.body
  
    const regResult = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Update successful.`
      )
      res.status(201).redirect("/account")
    } else {
      req.flash("notice", "Sorry, the update failed.")
      res.status(501).redirect("/account")
    }
  }

/* ****************************************
*  Process Password Update
* *************************************** */
async function updatePassword(req, res) {
  let tools = res.locals.tools
  let account_id = res.locals.userdata.account_id
    let nav = await utilities.getNav()
    let userwelcome = await utilities.buildUserWelcome(res.locals.userdata)
    const { account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the update.')
    res.status(500).render("account/update", {
      errors: null,
      title: "Update Account Details",
      tools,
      nav,
      account_id
    })
  }
  
    const regResult = await accountModel.updatePassword(
      hashedPassword,
      account_id
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Update successful.`
      )
      res.status(201).redirect("/account")
    } else {
      req.flash("notice", "Sorry, the update failed.")
      res.status(501).redirect("/account")
    }
  }

/* ****************************************
*  Log the user out
* *************************************** */
async function logout(req, res) {
  res.clearCookie("jwt")
  req.flash(
    "notice",
    `Logged out.`
  )
  res.status(201).redirect("/")
}

  module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildAccountUpdate, updateAccount, updatePassword, logout }