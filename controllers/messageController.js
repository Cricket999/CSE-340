const messageModel = require("../models/message-model")
const utilities = require("../utilities/")
const messCont = {}

/* ****************************************
*  Deliver inbox view
* *************************************** */
messCont.buildInbox = async function(req, res, next) {
  let data = await messageModel.getMessages(res.locals.userdata.account_id)
  let archived = await messageModel.getArchivedMessageCount(res.locals.userdata.account_id)
  if (archived == 1) {
    archived += ' Archived Message'
  } else {
    archived += ' Archived Messages'
  }
  let messagelist = await utilities.buildMessageList(data)
  let messagelinks = `<ul>
    <li><a href="./send">Create New Message</a></li>
    <li><a href="./archive">View ${archived}</a></li>
    </ul>`

  let pagedata = messagelinks + '<br>' + messagelist

  let tools = res.locals.tools
    let nav = await utilities.getNav()
    let firstname = res.locals.userdata.account_firstname
    let lastname = res.locals.userdata.account_lastname
    res.render("messages/inbox", {
      title:`${firstname} ${lastname} Inbox`,
      tools,
      nav,
      pagedata,
      errors: null,
    })
  }

/* ****************************************
*  Deliver archive view
* *************************************** */
messCont.buildArchive = async function(req, res, next) {
  let data = await messageModel.getArchived(res.locals.userdata.account_id)
  let messagelist = await utilities.buildMessageList(data)
  let messagelinks = `<a href="./inbox">Return to Inbox</a>`

  let pagedata = messagelinks + '<br><br>' + messagelist

  let tools = res.locals.tools
  let nav = await utilities.getNav()
  let firstname = res.locals.userdata.account_firstname
  let lastname = res.locals.userdata.account_lastname
  res.render("messages/archive", {
    title:`${firstname} ${lastname} Archives`,
    tools,
    nav,
    pagedata,
    errors: null,
  })
}

/* ****************************************
*  Deliver read message view
* *************************************** */
messCont.buildReadMessage = async function(req, res, next) {
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  let data = await messageModel.getReadMessage(req.params.message_id)
  let pagedata = await utilities.buildReadMessage(data)
  res.render("messages/read", {
    title:`${data.message_subject}`,
    tools,
    nav,
    pagedata,
    errors: null,
  })
}

/* ****************************************
*  Archive a message
* *************************************** */
messCont.archiveMessage = async function(req, res, next) {
  const { message_id } = req.body
  messageModel.archiveMessage(message_id)
  res.redirect("/messages/inbox")
}

/* ****************************************
*  Unarchive a message
* *************************************** */
messCont.unarchiveMessage = async function(req, res, next) {
  const { message_id } = req.body
  messageModel.unarchiveMessage(message_id)
  res.redirect("/messages/inbox")
}

/* ****************************************
*  Mark a message as read
* *************************************** */
messCont.markMessageRead = async function(req, res, next) {
  const { message_id } = req.body
  messageModel.markMessageRead(message_id)
  res.redirect("/messages/inbox")
}

/* ****************************************
*  Mark a message as unread
* *************************************** */
messCont.markMessageUnread = async function(req, res, next) {
  const { message_id } = req.body
  messageModel.markMessageUnread(message_id)
  res.redirect("/messages/inbox")
}

/* ****************************************
*  Delete a message
* *************************************** */
messCont.deleteMessage = async function(req, res, next) {
  const { message_id } = req.body
  messageModel.deleteMessage(message_id)
  res.redirect("/messages/inbox")
}

/* ****************************************
*  Build send message view
* *************************************** */
messCont.buildSend = async function(req, res, next) {
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  let recipientlist = await utilities.buildAccountList(-1)
  res.render("messages/send", {
    title:`New Message`,
    tools,
    nav,
    recipientlist,
    errors: null,
  })
}

/* ****************************************
*  Process Send Message
* *************************************** */
messCont.sendNewMessage = async function(req, res) {
  let message_from = res.locals.userdata.account_id
    const { message_to, message_subject, message_body } = req.body
  
    const regResult = await messageModel.sendNewMessage(
      message_from,
      message_to,
      message_subject,
      message_body
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Message sent.`
      )
      res.status(201).redirect("/messages/inbox")
    } else {
      req.flash("notice", "Sorry, the message was not successfully sent.")
      let tools = res.locals.tools
      let nav = await utilities.getNav()
      let recipientlist = await utilities.buildAccountList(message_to)
      res.render("messages/send", {
        title:`New Message`,
        tools,
        nav,
        recipientlist,
        message_to,
        message_subject,
        message_body,
        errors: null,
      })
    }
  }

/* ****************************************
*  Deliver reply message view
* *************************************** */
messCont.buildReply = async function(req, res, next) {
  let tools = res.locals.tools
  let nav = await utilities.getNav()
  let data = await messageModel.getReadMessage(req.params.message_id)
  let recipient = await utilities.buildReplyRecipient(data.message_from)
  let message_id = data.message_id
  let message_subject = `RE: ${data.message_subject}`
  let message_body = `${data.message_body}\n\nMessage:\n`
  res.render("messages/reply", {
    title:`Reply Message`,
    tools,
    nav,
    recipient,
    message_id,
    message_subject,
    message_body,
    errors: null,
  })
}

/* ****************************************
*  Process Reply
* *************************************** */
messCont.replyMessage = async function(req, res) {
  let message_from = res.locals.userdata.account_id
    const { message_to, message_subject, message_body } = req.body
  
    const regResult = await messageModel.sendNewMessage(
      message_from,
      message_to,
      message_subject,
      message_body
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Reply sent.`
      )
      res.status(201).redirect("/messages/inbox")
    } else {
      req.flash("notice", "Sorry, the reply was not successfully sent.")
      let tools = res.locals.tools
      let nav = await utilities.getNav()
      let recipient = await utilities.buildReplyRecipient(message_to)
      res.render("messages/send", {
        title:`New Message`,
        tools,
        nav,
        recipient,
        message_subject,
        message_body,
        errors: null,
      })
    }
  }

module.exports = messCont