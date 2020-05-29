import {Injectable} from '@angular/core';
import * as AWSCognito from 'amazon-cognito-identity-js';
import {environment} from '../../environments/environment';
import {CognitoUserSession} from 'amazon-cognito-identity-js';
import {User} from './models/User';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {Plugins} from '@capacitor/core';
import {map, tap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _user = new BehaviorSubject<User>(null);

    private _userIsAuthenticated = false;
    private _userId = 'p1';

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
                    console.log('retrieving token here');
                    return token;
                } else {
                    return null;
                }
            })
        );
    }

    get token() {
        return this._user.asObservable().pipe(
            map(user => {
                if (user) {
                    if (user.token) {
                        return user.token;
                    } else {

                    }
                } else {
                    return null;
                }
            })
        );
    }

    constructor() {
    }

    logout() {
        console.log('logging out');
        this._user.next(null);
        Plugins.Storage.remove({key: 'authData'});
    }

    public getCurrentUser() {
        return new Observable<any>(obs => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = userPool.getCurrentUser();

            if (!cognitoUser) {
                console.log('no user');
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
                console.log('no user');
                return null;
            }

            console.log('signing out');
            cognitoUser.signOut();

            obs.next(cognitoUser);
            obs.complete();

        });
    }

    set currentUser(id: string) {
        this._userId = id;
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

    confirmUser(verificationCode, userName) {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = new AWSCognito.CognitoUser({
                Username: userName,
                Pool: userPool
            });

            cognitoUser.confirmRegistration(verificationCode, true, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolved(result);
                    console.log('confirmed');
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
                    this.setUserData(result);
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

    private getSession() {
        return new Observable<{ type: string, result: any }>(obs => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = userPool.getCurrentUser();

            if (!cognitoUser) {
                console.log('no user');
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
                    // return data.getAccessToken().getJwtToken();
                }
            });
        });
    }


    private setUserData(userData: CognitoUserSession) {
        const user = new User(
            userData.getAccessToken().payload.client_id,
            userData.getAccessToken().payload.username,
            userData.getAccessToken().getJwtToken(),
            new Date(+userData.getAccessToken().getExpiration() * 1000)
        );
        this._user.next(user);
        this.storeAuthData(
            user.id,
            user.token,
            user.tokenExpirationDate.toISOString(),
            user.username
        );
    }

    autoLogin() {
        return from(Plugins.Storage.get({key: 'authData'})).pipe(
            map(storedData => {
                if (!storedData || !storedData.value) {
                    return null;
                }
                const parsedData = JSON.parse(storedData.value) as {
                    token: string;
                    tokenExpirationDate: string;
                    userId: string;
                    username: string;
                };
                const expirationTime = new Date(parsedData.tokenExpirationDate);
                if (expirationTime <= new Date()) {
                    return null;
                }
                const user = new User(
                    parsedData.userId,
                    parsedData.username,
                    parsedData.token,
                    expirationTime
                );
                return user;
            }),
            tap(user => {
                if (user) {
                    this._user.next(user);
                }
            }),
            map(user => {
                return !!user;
            })
        );
    }

    private storeAuthData(
        userId: string,
        token: string,
        tokenExpirationDate: string,
        username: string
    ) {
        const data = JSON.stringify({
            userId,
            token,
            tokenExpirationDate,
            username
        });
        Plugins.Storage.set({key: 'authData', value: data});
    }

    resendVerificationCode(userName) {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = new AWSCognito.CognitoUser({
                Username: userName,
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

    forgotPassword(userName) {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = new AWSCognito.CognitoUser({
                Username: userName,
                Pool: userPool
            });

            // call forgotPassword on cognitoUser
            cognitoUser.forgotPassword({
                onSuccess: function (result) {
                    console.log('call result: ' + result);
                },
                onFailure: function (err) {
                    reject(err);
                },
                inputVerificationCode: function (data) { // this is optional, and likely won't be implemented as in AWS's example (i.e, prompt to get info)
                    console.log('verification data', data);
                    resolved(data);
                }
            });
        });
    }

    confirmPassword(userName: string, verificationCode: string, newPassword: string) {
        return new Promise((resolved, reject) => {
            const userPool = new AWSCognito.CognitoUserPool(environment._POOL_DATA);

            const cognitoUser = new AWSCognito.CognitoUser({
                Username: userName,
                Pool: userPool
            });

            cognitoUser.confirmPassword(verificationCode, newPassword, {
                onSuccess: () => {
                    resolved("success");
                },
                onFailure: (error) => {
                    console.error(error.message)
                    console.error(error.stack)
                    reject(error);
                }
            });
        })
    }
}
