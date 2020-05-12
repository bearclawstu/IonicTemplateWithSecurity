// Load the AWS SDK for JS
var AWS = require("aws-sdk");

// Set a region to interact with (make sure it's the same as the region of your table)
AWS.config.update({region: 'eu-west-2'});

// Set a table name that we can use later on
const tableName = "SunSalutation";

// Create the Document Client interface for DynamoDB
var ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

// Get a single item with the getItem operation and Document Client
module.exports.getProfile = async (event) => {
    try {
        const userName = event.pathParams.username;

        const PK = "USER#" + userName;
        const SK = "METADATA#" + userName;

        var params = {
            Key: {
                "PK": PK,
                "SK": SK
            },
            TableName: tableName
        };
        var result = await ddbDocumentClient.get(params).promise()
        return (JSON.stringify(result));
    } catch (error) {
        console.error(error);
    }
}
