import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    let user = localStorage.getItem('user');

    return new Promise((resolve) => {

      console.log("AuthGuard: activado");

      this.firebaseSvc.getAuth().onIdTokenChanged((auth) => {
        if (auth) {
          /*if (!user) {
            const elUsuario = {
              uid: auth.uid,
              email: auth.email,
              name: auth.displayName
            };
            this.utilsSvc.saveInLocalStorage('user', elUsuario);
            console.log("AuthGuard: No se detectó 'user' en LocalStorage, guardando uno...", localStorage.getItem('user'));
          }*/
          console.log("AuthGuard: sesión activa")
          resolve(true)
        }
        else {
          console.log("AuthGuard: sin sesión. Redirigiendo...")
          this.utilsSvc.routerLink('/auth');
          resolve(false);
        }
      })
    });
  }
}
