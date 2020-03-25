import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Observable, of } from 'rxjs';
import { tap, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailVerifiedGuard implements CanActivate {

  constructor(private auth: AuthService,private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    if(this.auth.user) {
      return this.auth.user.pipe(take(1),map(user => user && user.emailVerified ? true : false),tap(emailVerified => {
        if(!emailVerified) {
          this.router.navigateByUrl('/auth/verify');
        }
      }));
    } else {
      return of(true);
    }
  }
  
}
