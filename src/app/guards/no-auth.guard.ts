import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private firebaseSvc: FirebaseService, private utilsSvc: UtilsService) {}

  canActivate(): Observable<boolean> {

    console.log("NoAuthGuard: activado");

    return this.firebaseSvc.isAuthenticated.pipe(
      take(1),
      map(isAuth => {
        if (isAuth) {
          console.log("NoAuthGuard: sesión activa. Redirigiendo...");
          this.utilsSvc.routerLink('/main/home');
          return false;
        }
        console.log("NoAuthGuard: sin sesión");
        return true;
      })
    );

  }
  
}