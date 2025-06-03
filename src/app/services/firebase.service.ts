import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth'
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  //===================== Autenticación ======================
  isAuthenticated = this.auth.authState.pipe(
    map(user => !!user)
  );

  getAuth() {
    return getAuth();
  }

  //===================== Acceder ======================
  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(getAuth(), email, password)
  }

  //===================== Crear Usuario ======================
  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(getAuth(), email, password)
  }

  //===================== Actualizar Usuario ======================
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })
  }

  //===================== Enviar email para restablecer contraseña ======================
  sendRecoveryEmail(email: string) {
    const actionCodeSettings = {
      // URL a la que el usuario será redirigido después de un restablecimiento de contraseña exitoso
      // o si el usuario abre el enlace en un dispositivo donde la aplicación no está instalada.
      // Asegurarse de que este dominio esté autorizado en tu consola de Firebase.
      url: `${window.location.origin}/auth`, // O tu página de login/inicio. Ajusta '/auth' a tu ruta de login.
      handleCodeInApp: true, // Importante si quieres manejar el flujo en la app eventualmente
    };
    return sendPasswordResetEmail(getAuth(), email, actionCodeSettings);
  }
  //===================== Cerrar Sesión ======================
  signOut() {
    getAuth().signOut().then(() => {
      localStorage.removeItem('userAuth');
      localStorage.removeItem('userData');
      this.utilsSvc.routerLink('/auth');
    });
  }


  //===================== Base de Datos (Firestore) ======================

  //===================== Setear un documento ======================
  setDocument(path: string, data: any, mergeFields: boolean = false) { // Añadido parámetro mergeFields
    return setDoc(doc(getFirestore(), path), data, { merge: mergeFields }); // Usar la opción merge
  }

  //===================== Obtener un documento ======================
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

}
