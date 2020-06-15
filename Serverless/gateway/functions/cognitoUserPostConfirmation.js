
var DynamoDB = require('aws-sdk/clients/dynamodb');
var ddbDocumentClient = new DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let date = new Date();

    const tableName = process.env.TABLE_NAME;
    const defaultAvi = 'https://YOUR/DEFAULT/IMAGE';
    const primaryKey = 'USER#' + event.userName;
    const sortKey = 'METADATA#' + event.userName;

    // If the required parameters are present, proceed
    if (event.request.userAttributes.sub) {

        // -- Write data to DDB
        let ddbParams = {
            Item: {
                'PK': primaryKey,
                'SK': sortKey,
                'id': event.request.userAttributes.sub,
                '__typename': 'User',
                'picture': defaultAvi,
                'username': event.userName,
                'email': event.request.userAttributes.email,
                'createdAt': date.toISOString(),
            },
            TableName: tableName,
            ConditionExpression: 'PK <> :pkey AND #SK <> :skey',
            ExpressionAttributeNames: {
                '#SK' : 'SK'
            },
            ExpressionAttributeValues: {
                ':pkey' : primaryKey,
                ':skey' : sortKey
            }
        };

        // Call DynamoDB
        try {
            await ddbDocumentClient.put(ddbParams).promise();
        } catch (err) {
            const customError = {
                code: err.code,
                type: 'customLambdaError',
                message: "Unable to retrieve groups"
            };
            context.fail(JSON.stringify(customError));
        }

        context.done(null, event);

    } else {
        // Nothing to do, the user's email ID is unknown
        console.log("Error: Nothing was written to DDB or SQS");
        context.done(null, event);
    }
};
