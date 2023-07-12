const express = require("express")
const router = new express.Router()
const messageController = require("../controllers/messageController")
const messageValidate = require("../utilities/message-validation")
const utilities = require("../utilities")

// Route to build inbox view
router.get("/inbox", utilities.checkLogin, utilities.handleErrors(messageController.buildInbox))

// Route to build archive view
router.get("/archive", utilities.checkLogin, utilities.handleErrors(messageController.buildArchive))

// Route to build read message view
router.get("/read/:message_id", utilities.checkLogin, utilities.checkOwnerFromParams, utilities.handleErrors(messageController.buildReadMessage));

// Archive a message
router.post("/archive", utilities.checkLogin, utilities.checkOwnerFromBody, utilities.handleErrors(messageController.archiveMessage))

// Unarchive a message
router.post("/unarchive", utilities.checkLogin, utilities.checkOwnerFromBody, utilities.handleErrors(messageController.unarchiveMessage))

// Mark a message as read
router.post("/markread", utilities.checkLogin, utilities.checkOwnerFromBody, utilities.handleErrors(messageController.markMessageRead))

// Mark a message as unread
router.post("/markunread", utilities.checkLogin, utilities.checkOwnerFromBody, utilities.handleErrors(messageController.markMessageUnread))

// Delete a message
router.post("/delete", utilities.checkLogin, utilities.checkOwnerFromBody, utilities.handleErrors(messageController.deleteMessage))

// Route to build new message view
router.get("/send", utilities.checkLogin, utilities.handleErrors(messageController.buildSend))

// Route to send a new message
router.post("/send",
    utilities.checkLogin,
    messageValidate.messageRules(),
    messageValidate.checkMessageData,
    utilities.handleErrors(messageController.sendNewMessage)
    )

// Route to build reply view
router.get("/reply/:message_id", utilities.checkLogin, utilities.checkOwnerFromParams, utilities.handleErrors(messageController.buildReply))

// Route to reply to a message
router.post("/reply/:message_id",
    utilities.checkLogin,
    messageValidate.messageRules(),
    messageValidate.checkReplyData,
    utilities.handleErrors(messageController.replyMessage)
    )

module.exports = router;