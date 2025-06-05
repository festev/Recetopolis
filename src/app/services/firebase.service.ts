// Angular Core: Decoradores y funciones esenciales de Angular.
import { Injectable, inject } from '@angular/core';
// AngularFire: Módulos de compatibilidad para Firebase (v8).
import { AngularFireAuth } from '@angular/fire/compat/auth';
// Firebase SDK v9+ (Modular): Funciones específicas para autenticación.
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth'
// AngularFire: Módulo de compatibilidad para Firestore (v8).
import { AngularFirestore } from '@angular/fire/compat/firestore';
// Firebase SDK v9+ (Modular): Funciones específicas para Firestore.
import { getFirestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { map } from 'rxjs';

/**
 * @Injectable: Marca la clase como servicio inyectable.
 * `providedIn: 'root'` crea una única instancia compartida (singleton) para toda la aplicación.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  
  // Inyección de servicios Firebase y utilidades.
  // NOTA: Se usa AngularFireAuth para observables pero métodos modulares v9+ para operaciones.
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

 // =================================================================================================
  // Authentication Methods (Firebase SDK v9+ Modular)
  // =================================================================================================

   /**
   * @function isAuthenticated
   * @description Observable que indica si un usuario está autenticado.
   * @returns {Observable<boolean>} Verdadero si el usuario está autenticado.
   */
  isAuthenticated = this.auth.authState.pipe(
    map(user => !!user)
  );

    /**
   * @function getAuth
   * @description Devuelve la instancia de autenticación de Firebase.
   * @returns {Auth} Instancia de autenticación de Firebase.
   */
  getAuth() {
    return getAuth(); // Función modular de Firebase v9+.
  }

   /**
   * @function signIn
   * @description Inicia sesión con correo electrónico y contraseña.
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<UserCredential>} Promesa con las credenciales del usuario autenticado.
   */
  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(getAuth(), email, password)
  }

   /**
   * @function signUp
   * @description Crea un nuevo usuario con correo electrónico y contraseña.
   * @param {string} email - Correo electrónico del nuevo usuario.
   * @param {string} password - Contraseña del nuevo usuario.
   * @returns {Promise<UserCredential>} Promesa con las credenciales del usuario creado.
   */
  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(getAuth(), email, password)
  }

  /**
   * @function updateUser
   * @description Actualiza el nombre visible del usuario autenticado.
   * @param {string} displayName - Nuevo nombre visible.
   * @returns {Promise<void>} Promesa que se resuelve cuando se actualiza el perfil.
   */
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })
  }

    /**
   * @function updatePhotoUrl
   * @description Actualiza la URL de la foto de perfil del usuario.
   * @param {string} photoURL - Nueva URL de la foto de perfil.
   * @returns {Promise<void>} Promesa que se resuelve cuando se actualiza la foto.
   */
  updatePhotoUrl(photoURL: string) {
    return updateProfile(getAuth().currentUser, { photoURL })
  }
  
  /**
   * @function sendRecoveryEmail
   * @description Envía un correo para restablecer la contraseña del usuario.
   * @param {string} email - Correo electrónico del usuario.
   * @returns {Promise<void>} Promesa que se resuelve si el correo se envía correctamente.
   */
  sendRecoveryEmail(email: string) {
        // actionCodeSettings define el comportamiento del enlace de restablecimiento.
    const actionCodeSettings = {
      // URL de redirección después del restablecimiento exitoso.
      // Asegurarse de que este dominio esté autorizado en la consola de Firebase.
      url: `${window.location.origin}/auth`, // Ajusta '/auth' a tu ruta de login.
      handleCodeInApp: true, // Importante para manejar el flujo en la app
    };
    return sendPasswordResetEmail(getAuth(), email, actionCodeSettings);
  }

    /**
   * @function signOut
   * @description Cierra la sesión del usuario actual y limpia datos locales.
   * @returns {void}
   */
  signOut() {
    getAuth().signOut().then(() => {
      localStorage.removeItem('userAuth');
      localStorage.removeItem('userData');
      this.utilsSvc.routerLink('/auth');
    });
  }


  // =================================================================================================
  // Firestore Database Methods (Firebase SDK v9+ Modular)
  // =================================================================================================


    /**
   * @function setDocument
   * @description Crea o actualiza un documento en Firestore.
   * @param {string} path - Ruta del documento (colección/documento).
   * @param {any} data - Datos a guardar.
   * @param {boolean} [mergeFields=false] - Si se debe hacer un merge con los datos existentes.
   * @returns {Promise<void>} Promesa que se resuelve al guardar los datos.
   */
  setDocument(path: string, data: any, mergeFields: boolean = false) {
        // Usa la opción `merge` para actualizar campos específicos sin afectar otros.
    return setDoc(doc(getFirestore(), path), data, { merge: mergeFields });
  }

    /**
   * @function getDocument
   * @description Obtiene los datos de un documento de Firestore.
   * @param {string} path - Ruta del documento (colección/documento).
   * @returns {Promise<any>} Promesa con los datos del documento o undefined si no existe.
   */
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

}
