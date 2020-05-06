var AWS = require('aws-sdk')
const { uuid } = require('uuidv4')
var ses = new AWS.SES()

AWS.config.update({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
})
const dbObject = new AWS.DynamoDB.DocumentClient()

var RECEIVER = 'user@example.com'

exports.handler = function(event, context) {
    let response = {}
    try {
        sendEmail(event, function(err, data) {
            context.done(err, null)
        })
        response = {
            message: 'success'
        }
    } catch (e) {
        console.log('error', e)
    }
    return response
}

async function sendEmail(event, context) {
    var params = {
        Destination: {
            ToAddresses: [RECEIVER]
        },
        Message: {
            Body: {
                Text: {
                    Data: event.message,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: event.subject,
                Charset: 'UTF-8'
            }
        },
        Source: event.email
    }
    // ses.sendEmail(params, done);
    ses.sendEmail(params, function(err, data) {
        if (err) console.log('error', err)
        else {
            const details = {
                id: uuid(),
                sender: event.email,
                receiver: RECEIVER,
                name: event.name,
                subject: event.subject,
                contactNumber: event.contactNumber,
                message: event.message,
                date: new Date()
            }

            saveDetails(details, function(err, data) {
                context.done(err, null)
            })
        }
    })
}

async function saveDetails(data) {
    try {
        const params = {
            TableName: 'contactForm',
            Item: {
                id: data.id,
                sender: data.sender,
                receiver: data.receiver,
                name: data.name,
                subject: data.subject,
                contactNumber: data.contactNumber,
                message: data.message
            }
        }
        console.log('params', params)
        return await dbObject.put(params).promise()
    } catch (e) {
        console.log('error', e)
    }
}
