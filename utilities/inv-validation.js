const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")

/*  **********************************
 *  Add Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
    return [
        // Name must be a string with no special characters or spaces
        body("classification_name")
            .trim()
            .isLength({ min: 1 })
            .isAlphanumeric()
            .withMessage("Please provide a classification name.")
    ]
}

/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    let errors = []
    const pagedata = await utilities.buildAddClassification()
    console.log(validationResult(req))
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav,
            pagedata,
        })
        return
    }
    next()
}

/*  **********************************
 *  Add Inventory Validation Rules
 * ********************************* */
validate.addInventoryRules = () => {
    return [
      body("inv_make")
        .trim()
        .isLength({min: 1})
        .withMessage("Please provide a make."), // on error this message is sent.

        body("inv_model")
        .trim()
        .isLength({min: 1})
        .withMessage("Please provide a model."), // on error this message is sent.
  
        body("inv_year")
        .trim()
        .isLength({min: 4, max: 4})
        .withMessage("Please provide a 4-digit year."), // on error this message is sent.

        body("inv_description")
        .trim()
        .isLength({min: 1})
        .withMessage("Please provide a description."), // on error this message is sent.

        body("inv_image")
        .trim()
        .isLength({min: 1})
        .withMessage("Please provide an image."), // on error this message is sent.

        body("inv_thumbnail")
        .trim()
        .isLength({min: 1})
        .withMessage("Please provide a thumbnail."), // on error this message is sent.

        body("inv_price")
        .trim()
        .isLength({min: 1})
        .withMessage("Please provide a price."), // on error this message is sent.

        body("inv_miles")
        .trim()
        .isLength({min: 1})
        .withMessage("Please provide a mileage."), // on error this message is sent.

        body("inv_color")
        .trim()
        .isLength({min: 1})
        .withMessage("Please provide a color."), // on error this message is sent.
    ]
  }

/* ******************************
 * Check data and return errors or continue to add inventory
 * ***************************** */
validate.checkAddInventoryData = async (req, res, next) => {
    let errors = []
    const { inv_classification, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
    const pagedata = await utilities.buildAddInventory()
    console.log(validationResult(req))
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            pagedata,
            inv_classification,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        })
        return
    }
    next()
}

/* ******************************
 * Check data and return errors or continue to edit view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
    let errors = []
    const { inv_classification, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
    const classificationList = await utilities.buildAddInventory()
    console.log(validationResult(req))
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const itemName = `${inv_make} ${inv_model}`
        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit " + itemName,
            nav,
            classificationList: classificationList,
            inv_classification,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            inv_id
        })
        return
    }
    next()
}

module.exports = validate