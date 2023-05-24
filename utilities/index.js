const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
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

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util