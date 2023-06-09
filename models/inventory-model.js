const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}

/* ***************************
 *  Get all details for an item by detail_id
 * ************************** */
async function getDetailsById(detail_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            WHERE i.inv_id = $1`,
            [detail_id]
        )
        return data.rows
    } catch (error) {
        console.error("getdetailsbyid error" + error)
    }
}

/* ***************************
 *  Process new classification
 * ************************** */
async function addClassification(classification_name) {
    try {
        const sql = "INSERT INTO classification (classification_name) VALUES ($1)"
        return await pool.query(sql, [classification_name])
      } catch (error) {
        return error.message
      }
}

/* ***************************
 *  Process new inventory
 * ************************** */
async function addInventory(inv_classification, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) {
    try {
        const sql = `INSERT INTO inventory (classification_id, inv_make, inv_model, inv_year, inv_description,
            inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
        return await pool.query(sql, [inv_classification, inv_make, inv_model, inv_year, inv_description,
            inv_image, inv_thumbnail, inv_price, inv_miles, inv_color])
      } catch (error) {
        return error.message
      }
}

/* ***************************
 *  Update inventory data
 * ************************** */
async function updateInventory(inv_classification, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inventory_id) {
    try {
        const sql = `UPDATE public.inventory SET classification_id = $1, inv_make = $2, inv_model = $3, inv_year = $4, inv_description = $5, inv_image = $6, inv_thumbnail = $7, inv_price = $8, inv_miles = $9, inv_color = $10 WHERE inv_id = $11 RETURNING *`
        let params = [inv_classification, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inventory_id]
        let data = await pool.query(sql, params)
        return data.rows
      } catch (error) {
        return error.message
      }
}

/* ***************************
 *  Update inventory data
 * ************************** */
async function deleteInventory(inv_id) {
    try {
        const sql = `DELETE FROM inventory WHERE inv_id = $1`;
        let params = [inv_id]
        let data = await pool.query(sql, params)
        return data
      } catch (error) {
        return error.message
      }
}

module.exports = {getClassifications, getInventoryByClassificationId, getDetailsById, addClassification, addInventory, updateInventory, deleteInventory}