var AWS = require('aws-sdk')
var ses = new AWS.SES()

// configure aws with credentials
AWS.config.update({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
})

// initialise dynamodb object

const dbObject = new AWS.DynamoDB.DocumentClient()

var RECEIVER = 'user@example.com'

// Lambda handler
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
                    Data: 'Subscription request',
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: 'News Letter',
                Charset: 'UTF-8'
            }
        },
        Source: event.email
    }
    // ses.sendEmail(params, done);
    ses.sendEmail(params, function(err, data) {
        if (err) console.log('error', err)
        else {
            // build email send parameters

            const details = {
                id: Math.floor(Date.now() / 1000),
                email: event.email
            }

            saveDetails(details, function(err, data) {
                context.done(err, null)
            })
        }
    })
}

async function saveDetails(data) {
    try {
        // saving to dynamodb
        const params = {
            TableName: 'newsLetter',
            Item: {
                id: data.id,
                email: data.email
            }
        }
        console.log('params', params)
        return await dbObject.put(params).promise()
    } catch (e) {
        console.log('error', e)
    }
}
