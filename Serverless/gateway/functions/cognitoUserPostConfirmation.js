
var DynamoDB = require('aws-sdk/clients/dynamodb');
var ddbDocumentClient = new DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let date = new Date();

    const tableName = process.env.TABLE_NAME;
    const defaultAvi = 'https://YOUR/DEFAULT/IMAGE';

    // If the required parameters are present, proceed
    if (event.request.userAttributes.sub) {

        // -- Write data to DDB
        let ddbParams = {
            Item: {
                'PK': 'USER#' + event.userName,
                'SK': 'METADATA#' + event.userName,
                'id': event.request.userAttributes.sub,
                '__typename': 'User',
                'picture': defaultAvi,
                'username': event.userName,
                'email': event.request.userAttributes.email,
                'createdAt': date.toISOString(),
            },
            TableName: tableName
        };

        // Call DynamoDB
        try {
            await ddbDocumentClient.put(ddbParams).promise();
        } catch (err) {
            console.log("Error", err);
        }

        context.done(null, event);

    } else {
        // Nothing to do, the user's email ID is unknown
        console.log("Error: Nothing was written to DDB or SQS");
        context.done(null, event);
    }
};
