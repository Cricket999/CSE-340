const invModel = require("../models/inventory-model")
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
Util.buildUserWelcome = async function(accountData){
  let userWelcome = `<h2>Welcome ${accountData.account_firstname}</h2><p><a href="account/update">Update Account Information</a></p><br>`
  let accountType = accountData.account_type
  if ((accountType == 'Employee') || (accountType == 'Admin')) {
    userWelcome += `<h3>Inventory Management</h3><p><a href="/inv/">Inventory Management</a></p>`
  }
  return userWelcome
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
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util