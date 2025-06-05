import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserData, UserAuth } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service'; // Servicio para interactuar con Firebase
import { UtilsService } from 'src/app/services/utils.service'; // Servicio para utilidades (loaders, toasts, navegación, etc.)

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

   /**
   * Patrón de expresión regular para validar el formato del correo electrónico.
   * Este patrón es un poco más completo que el validador Validators.email por defecto de Angular.
   */
  private emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

  //* Definición del formulario reactivo para la autenticación.
  form = new FormGroup({
    email: new FormControl('', [
      Validators.required, // El correo es obligatorio
      Validators.email, // Valida que sea un formato de email básico
      Validators.pattern(this.emailPattern)]), // Valida contra el patrón personalizado para mayor precisión

    password: new FormControl('', [Validators.required]) // La contraseña es obligatoria
  });

  firebaseSvc = inject(FirebaseService); // Servicio para la lógica de Firebase (autenticación, base de datos)
  utilsSvc = inject(UtilsService); // Servicio para funcionalidades útiles y comunes en la UI

  constructor() {

  }

    /**
   * @function ngOnInit
   * @description Hook de inicialización del componente.
   * @returns {void}
   */
  ngOnInit() {
  }

  // Public Methods (accesibles desde el template)

    /**
   * @function submit
   * @description Envía el formulario de inicio de sesión, autentica al usuario y guarda sus datos en localStorage.
   * @returns {Promise<void>} Promesa que se resuelve una vez finalizado el proceso de login.
   */
  async submit() {
    if (this.form.valid) { // Procede solo si el formulario y sus campos son válidos

      // Muestra un indicador de carga mientras se procesa la solicitud
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {

        const res = await this.firebaseSvc.signIn(this.form.value.email, this.form.value.password);
        
        const userData = await this.firebaseSvc.getDocument(`users/${res.user.uid}`) as UserData;

        // Crea un objeto con la información esencial del usuario obtenida de la respuesta de Firebase
        const userAuth: UserAuth = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          photoURL: "",
        };

        // Guarda la información del usuario en el LocalStorage para persistir la sesión
        this.utilsSvc.saveInLocalStorage('userAuth', userAuth);
        this.utilsSvc.saveInLocalStorage('userData', userData);
        this.utilsSvc.routerLink('/main/home');
        this.form.reset();

        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida ${res.user.displayName || 'Usuario'}`, // Usar displayName si existe
          duration: 2000, // Ajustado para un mensaje de bienvenida
          color: 'primary',
          position: 'middle',
          icon: 'person-circle-outline'
        });

      } catch(error: any ) {
        console.log(error);

        this.utilsSvc.presentToast({
          message: this.firebaseErrorToString(error.code || error.message), // Función para traducir errores de Firebase
          duration: 3000, // Un poco más de tiempo para mensajes de error
          color: 'danger', // Color 'danger' para errores
          position: 'middle',
          icon: 'alert-circle-outline'
        });

      } finally {
        loading.dismiss();
      }
    } else {
      // Si el formulario no es válido, marca todos los controles como 'touched'
      // para que los mensajes de error se muestren en la UI.
      this.form.markAllAsTouched();
    }
  }

  // Getters para acceder fácilmente a los controles del formulario en el template

    /**
   * @function email
   * @description Getter para acceder al control 'email' del formulario.
   * @returns {FormControl | null} Control del campo 'email'.
   */
  get email() {
    return this.form.get('email');
  }

    /**
   * @function password
   * @description Getter para acceder al control 'password' del formulario.
   * @returns {FormControl | null} Control del campo 'password'.
   */
  get password() {
    return this.form.get('password');
  }
  // Función para traducir errores de Firebase a mensajes amigables

    /**
   * @function password
   * @description Getter para acceder al control 'password' del formulario.
   * @returns {FormControl | null} Control del campo 'password'.
   */
  firebaseErrorToString(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/user-disabled':
        return 'Este usuario ha sido deshabilitado.';
      case 'auth/user-not-found':
        return 'No se encontró ningún usuario con este correo electrónico.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.';
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está en uso por otra cuenta.';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil.';

      default:
        return 'Ocurrió un error. Por favor, intenta de nuevo.'; // Mensaje genérico
    }
  }

}

