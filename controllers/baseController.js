const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
    let tools = res.locals.tools
    const nav = await utilities.getNav()
    res.render("index", {title: "Home", tools, nav})
}

module.exports = baseController