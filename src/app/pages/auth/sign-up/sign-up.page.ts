// Angular Core Imports: Módulos y decoradores esenciales de Angular.
import { Component, inject, OnInit } from '@angular/core';
// FormControl, FormGroup y Validators para crear y validar formularios reactivos.
import { FormControl, FormGroup, Validators } from '@angular/forms';
// UserAuth y UserData definen la estructura de los datos de usuario.
import { UserAuth, UserData } from 'src/app/models/user.model';
// FirebaseService para interactuar con Firebase (autenticación, base de datos, etc.).
import { FirebaseService } from 'src/app/services/firebase.service';
// UtilsService para utilidades comunes (loaders, toasts, navegación, etc.).
import { UtilsService } from 'src/app/services/utils.service';

// @Component marca la clase como componente Angular y configura sus metadatos.
@Component({
  selector: 'app-sign-up', // Selector CSS para instanciar este componente.
  templateUrl: './sign-up.page.html', // Ruta al archivo HTML de la vista.
  styleUrls: ['./sign-up.page.scss'], // Ruta al archivo SCSS de estilos.
})
// SignUpPage implementa OnInit, hook que se llama después de inicializar el componente.
export class SignUpPage implements OnInit {

  // Definición del formulario reactivo. FormGroup agrupa varios FormControl.
  form = new FormGroup({
    uid: new FormControl(''), //// FormControl para el 'uid'. Inicialmente vacío, lo proporciona Firebase tras crear usuario.
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)])
  })

  firebaseSvc = inject(FirebaseService); // Instancia de FirebaseService para operaciones de Firebase.
  utilsSvc = inject(UtilsService) // Instancia de UtilsService para loaders, toasts, etc.


    /**
   * @function ngOnInit
   * @description Hook de inicialización del componente.
   * @returns {void}
   */
  ngOnInit() {
  }


    /**
   * @function submit
   * @description Registra un nuevo usuario en Firebase, guarda su información en Firestore y en localStorage, y redirige al home.
   * @returns {Promise<void>} Promesa que se resuelve cuando finaliza el proceso de registro.
   */
  async submit() {
        // Verifica si el formulario es válido (todos los campos cumplen sus validadores).
    if (this.form.valid) {
          // Muestra indicador de carga para que el usuario sepa que se está procesando.
      const loading = await this.utilsSvc.loading()
      await loading.present();

      try {
                // Llama al método 'signUp' del servicio Firebase con email y password.
        const res = await this.firebaseSvc.signUp(this.form.value.email!, this.form.value.password!);

                // Crea objeto userAuth con información esencial del usuario de Firebase.
        const userAuth: UserAuth = {
          uid: res.user.uid, // UID del usuario de Firebase.
          email: res.user.email, // Email del usuario de Firebase.
          displayName: this.form.value.name, // Nombre del usuario del formulario.
          photoURL: "",
        };

        // Crea objeto userData con datos adicionales del perfil de usuario.
        const userData: UserData = {
          bio: "",
          location: null,
          phoneNumber: "",
          favoritos: []
        };

        // Actualiza el perfil del usuario en Firebase Authentication con displayName.
        await this.firebaseSvc.updateUser(userAuth.displayName);
        // Guarda datos adicionales del usuario en Firestore.
        await this.firebaseSvc.setDocument(`users/${res.user.uid}`, userData, true)

        // Guarda información en LocalStorage para mantener sesión entre recargas.
        this.utilsSvc.saveInLocalStorage('userAuth', userAuth);
        this.utilsSvc.saveInLocalStorage('userData', userData);

        this.utilsSvc.routerLink('/main/home'); // Redirige al usuario a la página principal tras registro exitoso.
        this.form.reset(); // Resetea el formulario, limpiando todos los campos.

        // Muestra mensaje de bienvenida al usuario.
        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida, ${userAuth.displayName}`,
          duration: 1500,
          color: 'primary',
          position:'middle',
          icon: 'person-circle-outline'
        })


      } catch(error: any) {
        console.log(error);

        // Muestra toast con el mensaje de error al usuario.
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })


      } finally {
        loading.dismiss(); // Oculta el indicador de carga siempre, sea éxito o error.
      }
    }
  }

}
