// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inv-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build detail view
router.get("/detail/:detailId", utilities.handleErrors(invController.buildByDetailId));

// Route to build management view
router.get("", utilities.handleErrors(invController.buildManagement));

// Route to build add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Route to add a classification
router.post("/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification));

// Route to build add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

//Route to add an inventory item
router.post("/add-inventory",
    invValidate.addInventoryRules(),
    invValidate.checkAddInventoryData,
    utilities.handleErrors(invController.addInventory));

module.exports = router;