import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map, switchMap, take, tap} from "rxjs/operators";
import {UserProfile} from "../models/UserProfile";

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    constructor(private http: HttpClient) {
    }

    getUserProfile(userName: string): Observable<any> {
        return this.http.get<any>(`profile/${userName}`)
            .pipe(
                take(1),
                map(profile => {
                    return new UserProfile(profile.Item.name, profile.Item.username, profile.Item.email, profile.Item.picture, profile.Item.createdAt);
                })
            )
    }

    updateUserProfile(profile: UserProfile): Observable<any> {
        return this.http.post<any>(`profile`, profile);
    }
}
