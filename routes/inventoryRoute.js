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
router.get("", utilities.checkAuthorization, utilities.handleErrors(invController.buildManagement));

// Route to get classifications for management
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build add classification view
router.get("/add-classification", utilities.checkAuthorization, utilities.handleErrors(invController.buildAddClassification));

// Route to add a classification
router.post("/add-classification",
    utilities.checkAuthorization,
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification));

// Route to build add inventory view
router.get("/add-inventory", utilities.checkAuthorization, utilities.handleErrors(invController.buildAddInventory));

//Route to add an inventory item
router.post("/add-inventory",
    utilities.checkAuthorization,
    invValidate.addInventoryRules(),
    invValidate.checkAddInventoryData,
    utilities.handleErrors(invController.addInventory));

// Route to build item edit view
router.get("/edit/:inventory_id", utilities.checkAuthorization, utilities.handleErrors(invController.buildEditInventory));

// Route to edit item in inventory
router.post("/edit-inventory/",
utilities.checkAuthorization,
invValidate.addInventoryRules(),
invValidate.checkUpdateData,
utilities.handleErrors(invController.updateInventory));

// Route to build item delete view
router.get("/delete/:inventory_id", utilities.checkAuthorization, utilities.handleErrors(invController.buildDeleteInventory));

// Route to delete item from inventory
router.post("/delete/", utilities.checkAuthorization, utilities.handleErrors(invController.deleteInventory));

module.exports = router;