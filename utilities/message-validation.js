const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const messageModel = require("../models/message-model")

/*  **********************************
 *  Message Data Validation Rules
 * ********************************* */
validate.messageRules = () => {
    return [
        // Message must have a recipient.
        body("message_to")
            .exists()
            .withMessage("Please select a recipient."), // on error this message is sent.

        // Subject must be a string that is not empty.
        body("message_subject")
            .trim()
            .notEmpty()
            .escape()
            .withMessage("Please provide a subject."), // on error this message is sent.
        
        // Message body must be a string that is not empty.
        body("message_body")
            .trim()
            .notEmpty()
            .escape()
            .withMessage("Please provide a message."), // on error this message is sent.
    ]
}

/* ******************************
 * Check data and return errors or send a message
 * ***************************** */
validate.checkMessageData = async (req, res, next) => {
    let { message_to, message_subject, message_body } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let tools = res.locals.tools
      let nav = await utilities.getNav()
      let recipientlist = await utilities.buildAccountList(message_to)
      res.render("messages/send", {
        errors,
        title: `New Message`,
        tools,
        nav,
        recipientlist,
        message_to,
        message_subject,
        message_body,
      })
      return
    }
    next()
  }

/* ******************************
 * Check data and return errors or send a reply
 * ***************************** */
validate.checkReplyData = async (req, res, next) => {
  let { message_to, message_subject, message_body, message_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let tools = res.locals.tools
    let nav = await utilities.getNav()
    let recipient = await utilities.buildReplyRecipient(message_to)
    res.render("messages/reply", {
      errors,
      title: `Reply Message`,
      tools,
      nav,
      recipient,
      message_id,
      message_subject,
      message_body,
    })
    return
  }
  next()
}

module.exports = validate