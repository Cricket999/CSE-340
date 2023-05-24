const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try{
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch {
    throw new ServerError("Invalid type!")
  }
}

/* ***************************
 *  Build detail view
 * ************************** */
invCont.buildByDetailId = async function (req, res, next) {
  const detail_id = req.params.detailId
  const data = await invModel.getDetailsById(detail_id)
  const pagedata = await utilities.buildDetailGrid(data)
  let nav = await utilities.getNav()
  res.render("./inventory/details", {
    title: data[0].inv_year + ' ' + data[0].inv_make + ' ' + data[0].inv_model,
    nav,
    pagedata,
  })
}

class ServerError extends Error {
  constructor(message) {
    super(message);
    this.status = 500;
  }
}

module.exports = invCont