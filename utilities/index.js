const invModel = require("../models/inventory-model")
const messageModel = require("../models/message-model")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 * ************************ */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the detail view HTML
* ************************************ */
Util.buildDetailGrid = async function(data){
  let pagedata
  if(data.length == 1){
    pagedata = '<div id="detailcontent">'
    pagedata += '<div id="imgcontainer"><img src=' + data[0].inv_image + ' alt="' + data[0].inv_year + ' ' + data[0].inv_make + ' ' + data[0].inv_model + '"></div>'
    pagedata += '<div id="pricecontainer">'
    pagedata += '<h2>Price: $' + new Intl.NumberFormat('en-US').format(data[0].inv_price) + '</h2>'
    pagedata += '</div>'
    pagedata += '<p id="miles" class="pagedata"><b>Mileage:</b> ' + new Intl.NumberFormat('en-US').format(data[0].inv_miles) + '</p>'
    pagedata += '<p id="color" class="pagedata"><b>Color:</b> ' + data[0].inv_color + '</p>'
    pagedata += '<p id="description" class="pagedata">' + data[0].inv_description + '</p>'
    pagedata += '</div>'

    return pagedata
  } else {
    pagedata = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
}

/* **************************************
* Build the add classification view HTML
* ************************************ */
Util.buildAddClassification = async function(){
  let pagedata = `<div id="formholder">
    <form id="addclassification" action="/inv/add-classification" method="post">
      <label for="classification_name">Enter a name with no special characters or spaces.</label><br>
      <input id="classification_name" name="classification_name" type="text" required pattern="[a-zA-Z0-9]*"><br>
      <input id="submit" type="submit" value="Add Classification"><br>
    </form>
  </div>`

  return pagedata
}

/* **************************************
* Build the add inventory view HTML
* ************************************ */
Util.buildAddInventory = async function(){
  let data = await invModel.getClassifications()
  let pagedata = '<select id="inv_classification" name="inv_classification" placeholder="Choose a Classification">'
  data.rows.forEach((row) => {
    pagedata += `<option value="` + row.classification_id + `">` + row.classification_name + `</option>\n`
  })
  pagedata += '</select><br>' 

  return pagedata
}

/* **************************************
* Build the user welcome for account management
* ************************************ */
Util.buildUserWelcome = async function(accountData, unreadmessages){
  let userWelcome = `<h2>Welcome ${accountData.account_firstname}</h2><p><a href="account/update">Update Account Information</a></p><br>
    <h3>Message Center</h3><ul><li>You have ${unreadmessages}.</li><li>Go to <a href="messages/inbox">Inbox</a></li></ul><br>`
  let accountType = accountData.account_type
  if ((accountType == 'Employee') || (accountType == 'Admin')) {
    userWelcome += `<h3>Inventory Management</h3><p><a href="/inv/">Inventory Management</a></p>`
  }
  return userWelcome
}

/* **************************************
* Build the inbox view message list
* ************************************ */
Util.buildMessageList = async function(data){
  let messagelist = `<table id="message_list">
    <tr>
      <th>Received</th>
      <th>Subject</th>
      <th>From</th>
      <th>Read</th>
    </tr>`
    data.forEach(message => {
      let created = new Date(message.message_created).toLocaleString()
      let from = `${message.account_firstname} ${message.account_lastname}`

      messagelist += '<tr>'
      messagelist += `<td>${created}</td>`
      messagelist += `<td><a href="read/${message.message_id}">${message.message_subject}</a></td>`
      messagelist += `<td>${from}</td>`
      messagelist += `<td>${message.message_read}</td>`
      messagelist += '</tr>'
    })
    messagelist += '</table>'
  return messagelist
}

/* **************************************
* Build a message from the messaging system
* ************************************ */
Util.buildReadMessage = async function(data) {
  pagedata = `<b>Subject:</b> ${data.message_subject}<br>
  <b>From:</b> ${data.account_firstname} ${data.account_lastname}<br>
  <b>Message:</b><br>${data.message_body}
  <hr>
  <form id="messageid">
  <input type="hidden" id="message_id" name="message_id" value="${data.message_id}">`
  // Build return link
  if (data.message_archived) {
    pagedata += `<a href="../archive">Return to Archive</a><br>`
  } else {
    pagedata += `<a href="../inbox">Return to Inbox</a><br>`
  }
  // Build reply button
  pagedata += `<a id="reply" href="/messages/reply/${data.message_id}">Reply</a><br>`
  // Build read and unread buttons
  if (data.message_read) {
    pagedata += `<button id="markunread" type="submit" form="messageid" formaction="/messages/markunread" formmethod="post">Mark as Unread</button>`
  } else {
    pagedata += `<button id="markread" type="submit" form="messageid" formaction="/messages/markread" formmethod="post">Mark as Read</button>`
  } pagedata += `<br>`
  // Build archive buttons
  if (data.message_archived) {
    pagedata += `<button id="unarchive" type="submit" form="messageid" formaction="/messages/unarchive" formmethod="post">Unarchive Message</button>`
  } else {
    pagedata += `<button id="archive" type="submit" form="messageid" formaction="/messages/archive" formmethod="post">Archive Message</button>`
  } pagedata += `<br>`
  // Build delete button
  pagedata += `<button id="delete" type="submit" form="messageid" formaction="/messages/delete" formmethod="post">Delete Message</button>`
  pagedata += `</form>`
  return pagedata
}

/* ****************************************
* Build a list of accounts to send messages to
**************************************** */
Util.buildAccountList = async function(message_to) {
  let accounts = await messageModel.getAccountList()
  let message_to_chosen = false
  let acclist = `<label for="message_to">To:</label><br>
    <select name="message_to" id="message_to" required>`
  // Build the list
  let toadd = ""
  accounts.forEach((account) => {
    if (message_to == account.account_id) {toadd += `<option id="option_${account.account_id}" selected value="${account.account_id}">
    ${account.account_firstname} ${account.account_lastname}</option>`, message_to_chosen = true}
    else {toadd += `<option id="option_${account.account_id}" value="${account.account_id}">${account.account_firstname} ${account.account_lastname}</option>`}
  })
  // Build the placeholder option
  if (!message_to_chosen) {acclist += `<option id="option_-1" value="" disabled selected hidden>Select a recipient</option>`}
  // Add the rest of the list
  acclist += toadd
  acclist += `</select>`
  return acclist
}

/* ****************************************
* Choose who to send a reply to
**************************************** */
Util.buildReplyRecipient = async function(message_to) {
  let account = await accountModel.getAccountById(message_to)
  let recipient = `<label for="message_to">To:</label><br>
  <input id="message_to" name="message_to" value="${message_to}" hidden>${account.account_firstname} ${account.account_lastname}`
  return recipient
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.tools = `<a title="Welcome" href="/account">Welcome ${accountData.account_firstname}</a><br><a title="Logout" href="/account/logout">Logout</a>`
     res.locals.userdata = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
    res.locals.tools = '<a title="Click to log in" href="/account/login">My Account</a>'
   next()
  }
 }

/* ****************************************
* Middleware to check authorization
**************************************** */
Util.checkAuthorization = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
     req.cookies.jwt,
     process.env.ACCESS_TOKEN_SECRET,
     function (err, accountData) {
      if (err) {
       req.flash("Please log in")
       res.clearCookie("jwt")
       return res.redirect("/account/login")
      }
      let accountType = accountData.account_type
      if ((accountType == 'Employee') || (accountType == 'Admin')) {
        next()
      } else {
        return res.redirect("/")
      }
     })
   } else {
    return res.redirect("/")
   }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 *  Check message ownership
 * ************************************ */
Util.checkOwnerFromParams = async (req, res, next) => {
  const message_id = req.params.message_id
  const owner = await messageModel.getOwner(message_id)
  console.log(res.locals.userdata)
  if (res.locals.userdata.account_id == owner) {
    next()
  } else {
    req.flash("notice", "Access denied.")
    return res.redirect("/account")
  }
}

Util.checkOwnerFromBody = async (req, res, next) => {
  const { message_id } = req.body
  const owner = await messageModel.getOwner(message_id)
  console.log(res.locals.userdata)
  if (res.locals.userdata.account_id == owner) {
    next()
  } else {
    req.flash("notice", "Access denied.")
    return res.redirect("/account")
  }
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util