const pool = require("../database/")

/* **********************
 * Get unread message count
 * ********************* */
async function getUnreadMessageCount(account_id) {
    try {
        const data = await pool.query(
            `SELECT COUNT(*) FROM public.message m
            WHERE message_to = $1 AND message_read = $2`,
            [account_id, false]
        )
        console.log("Count: " + data.rows[0].count)
        return data.rows[0].count
    } catch (error) {
        console.error("getmessages error " + error)
    }
}

/* **********************
 * Get unarchived messages
 * ********************* */
async function getMessages(account_id) {
    try {
        const data = await pool.query(
            `SELECT message_id, message_created, message_subject, message_read, a.account_firstname, a.account_lastname FROM public.message m
            JOIN public.account AS a
            ON m.message_from = a.account_id
            WHERE message_to = $1 AND message_archived = $2
            ORDER BY message_created`,
            [account_id, false]
        )
        return data.rows
    } catch (error) {
        console.error("getmessages error " + error)
    }
}

/* **********************
 * Get archived message count
 * ********************* */
async function getArchivedMessageCount(account_id) {
    try {
        const data = await pool.query(
            `SELECT COUNT(*) FROM public.message m
            WHERE message_to = $1 AND message_archived = $2`,
            [account_id, true]
        )
        return data.rows[0].count
    } catch (error) {
        console.error("getmessages error " + error)
    }
}

/* **********************
 * Get archived messages
 * ********************* */
async function getArchived(account_id) {
    try {
        const data = await pool.query(
            `SELECT message_id, message_created, message_subject, message_read, a.account_firstname, a.account_lastname FROM public.message m
            JOIN public.account AS a
            ON m.message_from = a.account_id
            WHERE message_to = $1 AND message_archived = $2
            ORDER BY message_created`,
            [account_id, true]
        )
        return data.rows
    } catch (error) {
        console.error("getmessages error " + error)
    }
}

/* **********************
 * Get a message to read
 * ********************* */
async function getReadMessage(message_id) {
    try {
        const data = await pool.query(
            `SELECT message_id, message_subject, message_read, message_body, message_archived, message_from, a.account_firstname, a.account_lastname FROM public.message m
            JOIN public.account AS a
            ON m.message_from = a.account_id
            WHERE message_id = $1`,
            [message_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("getmessage error " + error)
    }
}

/* **********************
 * Archive a message
 * ********************* */
async function archiveMessage(message_id) {
    try {
        const data = await pool.query(
            `UPDATE public.message SET message_archived = true
            WHERE message_id = $1`,
            [message_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("archivemessage error " + error)
    }
}

/* **********************
 * Unarchive a message
 * ********************* */
async function unarchiveMessage(message_id) {
    try {
        const data = await pool.query(
            `UPDATE public.message SET message_archived = false
            WHERE message_id = $1`,
            [message_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("unarchivemessage error " + error)
    }
}

/* **********************
 * Mark a message as read
 * ********************* */
async function markMessageRead(message_id) {
    try {
        const data = await pool.query(
            `UPDATE public.message SET message_read = true
            WHERE message_id = $1`,
            [message_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("archivemessage error " + error)
    }
}

/* **********************
 * Mark a message as unread
 * ********************* */
async function markMessageUnread(message_id) {
    try {
        const data = await pool.query(
            `UPDATE public.message SET message_read = false
            WHERE message_id = $1`,
            [message_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("archivemessage error " + error)
    }
}

/* **********************
 * Delete a message
 * ********************* */
async function deleteMessage(message_id) {
    try {
        const data = await pool.query(
            `DELETE FROM public.message
            WHERE message_id = $1`,
            [message_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("unarchivemessage error " + error)
    }
}

/* **********************
 * Get the owner id of a message
 * ********************* */
async function getOwner(message_id) {
    try {
        const data = await pool.query(
            `SELECT message_to FROM public.message
            WHERE message_id = $1`,
            [message_id]
        )
        const owner = data.rows[0].message_to
        return owner
    } catch (error) {
        console.error("getmessageowner error " + error)
    }
}

/* **********************
 * Get all accounts
 * ********************* */
async function getAccountList(){
    try {
      const sql = "SELECT account_id, account_firstname, account_lastname FROM account"
      const email = await pool.query(sql)
      return email.rows
    } catch (error) {
      return error.message
    }
  }

/* *****************************
 * Send a message
 * *************************** */
async function sendNewMessage(message_from, message_to, message_subject, message_body){
    try {
      const sql = `INSERT INTO public.message(
        message_subject, message_body, message_to, message_from)
        VALUES ($1, $2, $3, $4) RETURNING *`
      return await pool.query(sql, [message_subject, message_body, message_to, message_from])
    } catch (error) {
      return error.message
    }
  }

module.exports = { getUnreadMessageCount, getMessages, getArchivedMessageCount, getArchived, 
    getReadMessage, archiveMessage, unarchiveMessage, markMessageRead, markMessageUnread, deleteMessage, getOwner, getAccountList, sendNewMessage }