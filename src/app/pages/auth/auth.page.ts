// src/app/pages/auth/auth.page.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms'; // Asegúrate que FormControl y FormGroup estén importados
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  private emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(this.emailPattern)]),

    password: new FormControl('', [Validators.required])
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  constructor() {

  }

  ngOnInit() {
  }

  async submit() {
    if (this.form.valid) {

      const loading = await this.utilsSvc.loading();
      await loading.present();

      this.firebaseSvc.signIn(this.form.value as User).then(res => {


        const elUsuario = { uid: res.user.uid, email: res.user.email, displayName: res.user.displayName };
        this.utilsSvc.saveInLocalStorage('user', elUsuario);
        this.utilsSvc.routerLink('/main/home'); // Asegúrate que esta ruta sea la correcta post-login
        this.form.reset();

        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida ${elUsuario.displayName || 'Usuario'}`, // Usar displayName si existe
          duration: 2000, // Ajustado para un mensaje de bienvenida
          color: 'primary',
          position: 'middle',
          icon: 'person-circle-outline'
        });

      }).catch(error => {
        console.log(error);

        this.utilsSvc.presentToast({
          message: this.firebaseErrorToString(error.code || error.message), // Función para traducir errores de Firebase
          duration: 3000, // Un poco más de tiempo para mensajes de error
          color: 'danger', // Color 'danger' para errores
          position: 'middle',
          icon: 'alert-circle-outline'
        });

      }).finally(() => {
        loading.dismiss();
      });
    } else {
      // Si el formulario no es válido, marca todos los controles como 'touched'
      // para que los mensajes de error se muestren en la UI.
      this.form.markAllAsTouched();
    }
  }

  // Getters para acceder fácilmente a los controles del formulario en el template
  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }
  // Función para traducir errores de Firebase a mensajes amigables
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

  /*
  // Tu función getUserInfo original, comentada como la tenías.
  // Si la necesitas, asegúrate de que la lógica y el manejo de errores sean consistentes.
  async getUserInfo(uid: string) {
    if (this.form.valid) { // Considera si esta validación de formulario es necesaria aquí

      const loading = await this.utilsSvc.loading()
      await loading.present();

      let path =  `users/${uid}`

      this.firebaseSvc.getDocument(path).then((user: User) => {

        this.utilsSvc.saveInLocalStorage('user',user);
        this.utilsSvc.routerLink('/main/home');
        this.form.reset();

        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida ${user.name}`, // Asumiendo que User tiene 'name'
          duration:1500,
          color: 'primary',
          position:'middle',
          icon: 'person-circle-outline'
        })

      }).catch(error =>{
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message, // Considera usar firebaseErrorToString aquí también
          duration:2500,
          color: 'danger', // Color 'danger' para errores
          position:'middle',
          icon: 'alert-circle-outline'
        })

      }).finally(() =>{
        loading.dismiss();
      })
    }
  }
  */
}

