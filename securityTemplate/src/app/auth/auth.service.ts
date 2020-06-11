import {Injectable} from '@angular/core';
import * as AWSCognito from 'amazon-cognito-identity-js';
import {environment} from '../../environments/environment';
import {CognitoUserSession} from 'amazon-cognito-identity-js';
import {User} from './models/User';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {Plugins} from '@capacitor/core';
import {map, tap} from 'rxjs/operators';
import {ErrorService} from "../shared/error/error.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    get userIsAuthenticated() {
        return this.getSession().pipe(
            map(token => {
                if (token) {
                    return !!token;
                } else {
                    return false;
                }
            })
        );
    }

    get newToken() {
        return this.getSession().pipe(
            map(token => {
                if (token) {
                    return token;
                } else {
                    return null;
                }
            })
        );
    }

    constructor(private errorService: ErrorService) {
    }

    public getCurrentUser() {
        return new Observable<any>(obs => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = userPool.getCurrentUser();

            if (!cognitoUser) {
                return null;
            }

            obs.next(cognitoUser);
            obs.complete();

        });
    }

    public signOut() {
        return new Observable<any>(obs => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = userPool.getCurrentUser();

            if (!cognitoUser) {
                return null;
            }
            cognitoUser.signOut();

            obs.next(cognitoUser);
            obs.complete();

        });
    }

    signUp(username, email, password) {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const userAttribute = [];
            userAttribute.push(
                new AWSCognito.CognitoUserAttribute({Name: 'email', Value: email})
            );

            userPool.signUp(username, password, userAttribute, null, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolved(result);
                }
            });
        });
    }

    confirmUser(verificationCode, username) {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = new AWSCognito.CognitoUser({
                Username: username,
                Pool: userPool
            });

            cognitoUser.confirmRegistration(verificationCode, true, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolved(result);
                }
            });
        });
    }

    authenticateWithAWS(email, password) {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const authDetails = new AWSCognito.AuthenticationDetails({
                Username: email,
                Password: password
            });

            const cognitoUser = new AWSCognito.CognitoUser({
                Username: email,
                Pool: userPool
            });

            cognitoUser.authenticateUser(authDetails, {
                onSuccess: result => {
                    resolved(result);
                },
                onFailure: err => {
                    reject(err);
                },
                newPasswordRequired: userAttributes => {
                    // User was signed up by an admin and must provide new
                    // password and required attributes, if any, to complete
                    // authentication.

                    // the api doesn't accept this field back
                    userAttributes.email = email;
                    delete userAttributes.email_verified;

                    cognitoUser.completeNewPasswordChallenge(password, userAttributes, {
                        onSuccess(result) {
                        },
                        onFailure(error) {
                            reject(error);
                        }
                    });
                }
            });
        });
    }

    getLoggedOnUserToken() {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);
            const cognitoUser = userPool.getCurrentUser();

            if (cognitoUser != null) {
                cognitoUser.getSession(function(err, result) {
                    if (result) {
                        resolved(result.getIdToken().getJwtToken());
                    } else {
                        reject(err);
                    }
                });
            }
        });
    }

    private getSession() {
        return new Observable<{ type: string, result: any }>(obs => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = userPool.getCurrentUser();

            if (!cognitoUser) {
                obs.next(null);
                obs.complete();
                return;
            }

            cognitoUser.getSession(function (err, data) {
                if (err) {
                    obs.next(null);
                    obs.complete();
                } else {
                    obs.next(data.getIdToken().getJwtToken());
                    obs.complete();
                }
            });
        });
    }

    resendVerificationCode(username) {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = new AWSCognito.CognitoUser({
                Username: username,
                Pool: userPool
            });

            cognitoUser.resendConfirmationCode(function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolved(result);
                }
            });
        });
    }

    forgotPassword(username) {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = new AWSCognito.CognitoUser({
                Username: username,
                Pool: userPool
            });

            // call forgotPassword on cognitoUser
            cognitoUser.forgotPassword({
                onSuccess: function (result) {
                },
                onFailure: function (err) {
                    reject(err);
                },
                inputVerificationCode: function (data) { // this is optional, and likely won't be implemented as in AWS's example (i.e, prompt to get info)
                    resolved(data);
                }
            });
        });
    }

    confirmPassword(username: string, verificationCode: string, newPassword: string) {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = new AWSCognito.CognitoUser({
                Username: username,
                Pool: userPool
            });

            cognitoUser.confirmPassword(verificationCode, newPassword, {
                onSuccess: () => {
                    resolved("success");
                },
                onFailure: (error) => {
                    reject(error);
                }
            });
        })
    }

    deleteUserProfile(username: string, password: string) {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            var authenticationDetails = new AWSCognito.AuthenticationDetails({
                Username: username,
                Password: password,
            });
            const cognitoUser = userPool.getCurrentUser();

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: result => {
                    cognitoUser.deleteUser((err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolved("success");
                        }
                    });
                },
                onFailure: err => {
                    reject(err);
                }
            });
        })
    }
}
