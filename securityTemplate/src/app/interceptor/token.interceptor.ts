import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map, catchError, switchMap} from 'rxjs/operators';
import {
    Router
} from '@angular/router';
import {Injectable} from "@angular/core";
import {AuthService} from "../auth/auth.service";
import {environment} from "../../environments/environment";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    baseUrl = environment.BASE_URL;

    constructor(private router: Router,
                private authService: AuthService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        request = request.clone({
            url: this.baseUrl + request.url
        })

        return this.authService.newToken.pipe(
            switchMap(token => {
                if (token) {
                    request = request.clone({
                        setHeaders: {
                            'Authorization': token.toString()
                        }
                    });

                    return next.handle(request).pipe(
                        map((event: HttpEvent<any>) => {
                            return event;
                        }),
                        catchError((error: HttpErrorResponse) => {
                            if (error.status === 401) {
                                if (error.error.success === false) {
                                } else {
                                    this.router.navigate(['auth']);
                                }
                            }
                            return throwError(error);
                        }));
                }
            })
        );
    }

}
