import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {map, catchError, switchMap} from 'rxjs/operators';
import {
    Router
} from '@angular/router';
import {Injectable} from "@angular/core";
import {AuthService} from "../auth/auth.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    baseUrl = 'https://zl2o0po1w6.execute-api.eu-west-2.amazonaws.com/dev/';

    constructor(private router: Router,
                private authService: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        console.log('angel interceptor', request.url);

        request = request.clone({
            url : this.baseUrl + request.url
        })

        return this.authService.newToken.pipe(
            switchMap(token => {
                if (token) {
                    console.log('retrieving token here');
                    request = request.clone({
                        setHeaders: {
                            'Authorization': token.toString()
                        }
                    });

                    return next.handle(request).pipe(
                        map((event: HttpEvent<any>) => {
                            if (event instanceof HttpResponse) {
                                console.log('event--->>>', event);
                            }
                            return event;
                        }),
                        catchError((error: HttpErrorResponse) => {
                            if (error.status === 401) {
                                if (error.error.success === false) {
                                } else {
                                    this.router.navigate(['login']);
                                }
                            }
                            return throwError(error);
                        }));
                }
            })
        );
    }

}
