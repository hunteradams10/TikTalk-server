const {Message} = require('../database/schemas/MessagesSchema')

// create a new message
async function sendMessage(userMessage){
    let newMessage = new Message({ // create a new instance of message from MessagesSchema
        message: userMessage.message,
        senderId: userMessage.senderId,
        groupId: userMessage.groupId
    })

    let messageResult = await newMessage.save()
    return messageResult
}

module.exports = {
    sendMessage
}