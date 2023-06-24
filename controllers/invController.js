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
    let tools = res.locals.tools
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      tools,
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
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  res.render("./inventory/details", {
    title: data[0].inv_year + ' ' + data[0].inv_make + ' ' + data[0].inv_model,
    tools,
    nav,
    pagedata,
    errors: null,
  })
}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildAddInventory()
  res.render("./inventory/management", {
    title: "Management",
    tools,
    nav,
    classificationSelect,
    errors: null,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const pagedata = await utilities.buildAddClassification()
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    tools,
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
    let tools = res.locals.tools
    let nav = await utilities.getNav()
    req.flash("notice", `Classification ${classification_name} added.`)
    res.status(201).render("./inventory/add-classification", {
      title: "Add Classification",
      tools,
      nav,
      pagedata,
      errors: null,
    })
  } else {
    let tools = res.locals.tools
    let nav = await utilities.getNav()
    req.flash("notice", "There was an error adding the classification.")
    res.status(501).render("./inventory/add-classification", {
      title: "Add Classification",
      tools,
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
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    tools,
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
  let tools = res.locals.tools
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
      tools,
      nav,
      pagedata,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the inventory addition failed.")
    const pagedata = await utilities.buildAddInventory()
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      tools,
      nav,
      pagedata,
      errors: null,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  let inventory_id = parseInt(req.params.inventory_id)
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  const data = await invModel.getDetailsById(inventory_id)
  const itemData = data[0]
  const classificationList = await utilities.buildAddInventory()
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    tools,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ****************************************
*  Update inventory data
* *************************************** */
invCont.updateInventory = async function (req, res) {
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  const { inv_classification, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id } = req.body

  const updateResult = await invModel.updateInventory(
    inv_classification, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id)

  if (updateResult) {
    req.flash(
      "notice",
      `The ${inv_make} ${inv_model} was successfully updated.`
    )
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    const itemName = `${inv_make} ${inv_model}`
    const classificationList = await utilities.buildAddInventory()
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      tools,
      nav,
      classificationList: classificationList,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  let inventory_id = parseInt(req.params.inventory_id)
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  const data = await invModel.getDetailsById(inventory_id)
  const itemData = data[0]
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-inventory", {
    title: "Delete " + itemName,
    tools,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ****************************************
*  Delete inventory data
* *************************************** */
invCont.deleteInventory = async function (req, res) {
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  const { inv_make, inv_model, inv_year, inv_id, inv_price } = req.body

  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash(
      "notice",
      `The ${inv_make} ${inv_model} was successfully deleted.`
    )
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    const itemName = `${inv_make} ${inv_model}`
    res.status(501).render("inventory/delete-inventory", {
      title: "Delete " + itemName,
      tools,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price
    })
  }
}

module.exports = invCont