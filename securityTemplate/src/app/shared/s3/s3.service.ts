import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import * as aws from "aws-sdk";
import {v4 as uuidv4} from 'uuid';
import {AuthService} from "../../auth/auth.service";

@Injectable({
    providedIn: 'root'
})
export class S3Service {

    constructor(private authService: AuthService) {
    }

    upload(image, accessToken) {
        return new Promise((resolve, reject) => {
            aws.config.region = environment.REGION;
            aws.config.credentials = new aws.CognitoIdentityCredentials({
                IdentityPoolId: environment.COGNITO_IDENTITY.IDENTITY_POOL_ID,
                Logins: {
                    [`cognito-idp.${environment.REGION}.amazonaws.com/${environment._POOL_DATA.UserPoolId}`]: accessToken
                }
            });

            const imageUuid = uuidv4();

            var s3 = new aws.S3({
                apiVersion: "2006-03-01",
                params: {Bucket: environment.S3.BUCKET_NAME}
            });

            let buf = new Buffer(image, "base64");

            var data = {
                Bucket: environment.S3.BUCKET_NAME,
                Key: imageUuid,
                Body: buf,
                ContentEncoding: "base64",
                ContentType: "image/jpeg"
            };

            s3.putObject(data, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(imageUuid);
                }
            });
        });
    }

    getSignedURL(key: string): Promise<string> {
        return this.authService
            .getLoggedOnUserToken()
            .then((userToken: any) => {
                aws.config.region = environment.REGION;
                aws.config.credentials = new aws.CognitoIdentityCredentials({
                    IdentityPoolId: environment.COGNITO_IDENTITY.IDENTITY_POOL_ID,
                    Logins: {
                        [`cognito-idp.${environment.REGION}.amazonaws.com/${environment._POOL_DATA.UserPoolId}`]: userToken
                    }
                });

                const s3 = new aws.S3();

                return s3.getSignedUrlPromise('getObject', {
                    Bucket: environment.S3.BUCKET_NAME,
                    Key: key,
                    Expires: 60
                })
            });
    }
}
