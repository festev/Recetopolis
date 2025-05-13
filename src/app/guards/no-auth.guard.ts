import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return new Promise((resolve) => {

      console.log("NoAuthGuard: activado");

      this.firebaseSvc.getAuth().onAuthStateChanged((auth) => {

        if (!auth){
          console.log("NoAuthGuard: sin sesión");
          resolve(true);
        }
        else {
          console.log("NoAuthGuard: sesión activa. Redirigiendo...");
          this.utilsSvc.routerLink('/main/home');
          resolve(false);
        }
      })
    });
  }
}