// Load the AWS SDK for JS
var DynamoDB = require('aws-sdk/clients/dynamodb');

// Set a table name that we can use later on
const tableName = process.env.TABLE_NAME;

// Create the Document Client interface for DynamoDB
var ddbDocumentClient = new DynamoDB.DocumentClient();

// Get a single item with the getItem operation and Document Client
module.exports.updateProfile = async (event) => {
  try {
    const username = event.body.username;
    const name = event.body.name;

    const PK = "USER#" + username;
    const SK = "METADATA#" + username;

    var params = {
      Key: {
        "PK": PK,
        "SK": SK
      },
      TableName: tableName,
      UpdateExpression: 'set #name = :n',
      ExpressionAttributeNames: {'#name' : 'name'},
      ExpressionAttributeValues: {':n' : name}
    };
    const result = await ddbDocumentClient.update(params).promise()
    return result;
  } catch (error) {
    console.error(error);
  }
}
