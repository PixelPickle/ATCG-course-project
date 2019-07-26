import {Injectable} from '@angular/core';
import {HttpHandler, HttpInterceptor, HttpParams, HttpRequest} from '@angular/common/http';
import {AuthService} from './auth.service';
import {exhaustMap, take} from 'rxjs/operators';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept( req: HttpRequest<any>, next: HttpHandler) {

    return this.authService.user.pipe(
      take(1),
      exhaustMap( (user) => {

        // If no authenticated user, don't change request
        if (!user) {
          return next.handle(req);
        }

        // Add the Authentication Token to the Params
        const modifiedRequest = req.clone( { params: new HttpParams().set('auth', user.token) } );

        // Return the New Request that has the New Params
        return next.handle(modifiedRequest);
      })
    );
  }
}
