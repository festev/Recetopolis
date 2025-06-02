import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private firebaseSvc: FirebaseService, private utilsSvc: UtilsService) {}

  canActivate(): Observable<boolean> {

    console.log("AuthGuard: activado");
    return this.firebaseSvc.isAuthenticated.pipe(
      take(1),
      map(isAuth => {
        if (!isAuth) {
          console.log("AuthGuard: sesión inactiva. Redirigiendo...");
          this.utilsSvc.routerLink('/auth');
          return false;
        }
        console.log("AuthGuard: sesión activa");
        return true;
      })
    );
  }

}
