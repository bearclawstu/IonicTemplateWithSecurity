// Load the AWS SDK for JS
var DynamoDB = require('aws-sdk/clients/dynamodb');

// Set a table name that we can use later on
const tableName = process.env.TABLE_NAME;

// Create the Document Client interface for DynamoDB
var ddbDocumentClient = new DynamoDB.DocumentClient();

// Get a single item with the getItem operation and Document Client
module.exports.deleteProfile = async (event, context) => {
    try {
        const username = event.body.username;

        const PK = "USER#" + username;
        const SK = "METADATA#" + username;

        var params = {
            Key: {
                "PK": PK,
                "SK": SK
            },
            TableName: tableName
        };
        const result = await ddbDocumentClient.delete(params).promise()
        return result;
    } catch (error) {
        const customError = {
            code: error.code,
            type: 'customLambdaError',
            message: "Error deleting profile"
        };
        context.fail(JSON.stringify(customError));
    }
}
