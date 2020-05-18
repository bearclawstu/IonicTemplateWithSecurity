// Load the AWS SDK for JS
var AWS = require("aws-sdk");

// Set a table name that we can use later on
const tableName = process.env.TABLE_NAME;
const region = process.env.REGION;

// Set a region to interact with (make sure it's the same as the region of your table)
AWS.config.update({region: region});

// Create the Document Client interface for DynamoDB
var ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

// Get a single item with the getItem operation and Document Client
module.exports.updateProfile = async (event) => {
  try {
    console.log('Body:', event.body);
    const userName = event.body.userName;
    const name = event.body.name;

    const PK = "USER#" + userName;
    const SK = "METADATA#" + userName;

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
