import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanLoad,
    Route,
    Router,
    RouterStateSnapshot,
    UrlSegment,
    UrlTree
} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AuthService} from './auth.service';
import {switchMap, take, tap} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanLoad {

    constructor(private authService: AuthService,
                private router: Router) {
    }

    canLoad(
        route: Route,
        segments: UrlSegment[]):
        Observable<boolean> | Promise<boolean> | boolean {

        return this.authService.userIsAuthenticated.pipe(
            take(1),
            switchMap(isAuthenticated => {
                return of(isAuthenticated);
            }),
            tap(isAuthenticated => {
                if (!isAuthenticated) {
                    this.router.navigateByUrl('/auth');
                }
            })
        );
    }
}
