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
      errors: null,
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
    errors: null,
  })
}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Management",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const pagedata = await utilities.buildAddClassification()
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    pagedata,
    errors: null,
  })
}

/* ***************************
 *  Process new classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const pagedata = await utilities.buildAddClassification()
  const addResult = await invModel.addClassification(classification_name)
  if (addResult) {
    let nav = await utilities.getNav()
    req.flash("notice", `Classification ${classification_name} added.`)
    res.status(201).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      pagedata,
      errors: null,
    })
  } else {
    let nav = await utilities.getNav()
    req.flash("notice", "There was an error adding the classification.")
    res.status(501).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      pagedata,
      errors: null,
    })
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const pagedata = await utilities.buildAddInventory()
  let nav = await utilities.getNav()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    pagedata,
    errors: null,
  })
}

class ServerError extends Error {
  constructor(message) {
    super(message);
    this.status = 500;
  }
}

/* ****************************************
*  Process new inventory
* *************************************** */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const { inv_classification, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body

  const regResult = await invModel.addInventory(
    inv_classification, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
  )

  if (regResult) {
    req.flash(
      "notice",
      `${inv_make} ${inv_model} has been added to inventory.`
    )
    const pagedata = await utilities.buildAddInventory()
    res.status(201).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      pagedata,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the inventory addition failed.")
    const pagedata = await utilities.buildAddInventory()
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      pagedata,
      errors: null,
    })
  }
}

module.exports = invCont