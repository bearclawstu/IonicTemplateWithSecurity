// Load the AWS SDK for JS
var DynamoDB = require('aws-sdk/clients/dynamodb');

// Set a table name that we can use later on
const tableName = process.env.TABLE_NAME;

// Create the Document Client interface for DynamoDB
var ddbDocumentClient = new DynamoDB.DocumentClient();

// Get a single item with the getItem operation and Document Client
module.exports.getProfile = async (event, context) => {
    try {
        const username = event.pathParams.username;

        const PK = "USER#" + username;
        const SK = "METADATA#" + username;

        var params = {
            Key: {
                "PK": PK,
                "SK": SK
            },
            TableName: tableName
        };
        const result = await ddbDocumentClient.get(params).promise()
        return result;
    } catch (error) {
        const customError = {
            code: error.code,
            type: 'customLambdaError',
            message: "Unable to retrieve profile"
        };
        context.fail(JSON.stringify(customError));
    }
}
