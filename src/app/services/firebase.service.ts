import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth'
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  //firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  //===================== Autenticación ======================
  getAuth(){
    return getAuth();
  }


  //===================== Acceder ======================
  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password)
  }

  //===================== Crear Usuario ======================
  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password)
  }

  //===================== Actualizar Usuario ======================
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })
  }

  //===================== Enviar email para restablecer contraseña ======================
  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }
  //===================== Cerrar Sesión ======================
  signOut() {
    getAuth().signOut().then(() => {
      localStorage.removeItem('user');
      //this.utilsSvc.routerLink('/auth');  //al parecer el AuthGuard detecta solo de que ya no hay sesión y redirige solo
    });
  }


  //===================== Base de Datos ======================

  //===================== Setear un documento ======================
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  //===================== Obtener un documento ======================
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }
}
