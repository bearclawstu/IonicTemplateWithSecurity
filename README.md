# IonicTemplateWithSecurity
A template project for Ionic with inbuilt authentication based on Cognito and a starter for a severless backend

This project will provide everything you need to rapidly start developing an app with Ionic and a completely 
serverless backend built in AWS

### Prerequisites
* Serverless framework (https://www.serverless.com/)  
* An AWS account
* NodeJs (https://nodejs.org/)
* Ionic (https://ionicframework.com/)

### Serverless 
This will install the following resources in your AWS account
* A dynamoDB table (to store all your data)
* A Cognito User Pool (to hold all your users)
* A Cognito User Pool Client (for connecting your app to)
* A Congito Authorizer (for securing your endpoint to only people logged into your app)
* A Cognito Identity Pool (for allowing users access to secure S3 buckets)
* An API Gateway with associated Lambda functions
* An S3 bucket to store users profiles pictures

This will also automatically add a postConfirmation Lambda trigger on the Congito User Pool to automatically add a 
user to your dynamoDB table once they are verified.

The API gateway is configured to use a shared Gateway approach (https://www.serverless.com/examples/aws-node-shared-gateway/).  
This allows all of your different endpoints to be created in separate yml files but still linked to the same gateway.  
Results in quicker deployment, cleaner code and less chance of hitting the limit of 200 endpoints.  

### Installation
To install the serverless backend run the following command in the Serverless directory
```
ci-deploy.sh
```

Once the deployment has finished, go into the cloud formation service of your AWS account and you should see 
a stack named 'securityTemplate-dev'.  Click on that and then click on outputs and make note of:
* ApiUrl
* UserPoolClientId
* UserPoolId
* ProfileBucketName
* IdentityPoolId

(alternatively these outputs are displayed on the CLI that ci-deploy.sh is run on) 

For Ionic, run the following command in the securityTemplate directory
```
npm install
```

In the following files, replace the relevant data with your values from the cloud formation output  
* src/environments/environments.ts (UserPoolId, ClientId, identityPoolId, bucketName)
* src/app/interceptor/token.interceptor.ts (baseUrl)

Then in the securityTemplate directory run:
```
ionic serve
```

That should take you to a page allowing you to sign in/sign up.  
Once the email address has been verified, it will take you to the home page and 
a user will have been added to your dynamoDB table.

### Clean up
To remove all of the resources in AWS, run the following in the serverless direcrtory
```
ci-decomission.sh
```


