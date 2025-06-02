import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { FirebaseService } from '../../../services/firebase.service'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  email: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() { }

  async onSubmit() {
    if (!this.email) {
      this.presentToast('Por favor, ingresa tu correo electrónico.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.presentToast('Por favor, ingresa un correo electrónico válido.', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procesando...',
    });
    await loading.present();

    try {
      await this.firebaseService.sendRecoveryEmail(this.email);
      await loading.dismiss();

      // Creamos la alerta directamente aquí para añadir el handler de navegación
      const alert = await this.alertController.create({
        header: 'Correo Enviado',
        message: 'Si tu correo electrónico está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña en breve. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              // Navegar a /auth DESPUÉS de que el usuario presione OK
              this.router.navigate(['/auth']);
            }
          }
        ]
      });
      await alert.present();

    } catch (error: any) {
      await loading.dismiss();
      console.error('Error en la solicitud de restablecimiento:', error);

      // Mostramos mensaje genérico y permitimos navegar también
      const alert = await this.alertController.create({
        header: 'Información',
        message: 'Si tu correo electrónico está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña en breve. Por favor, revisa tu bandeja de entrada (y la carpeta de spam). Aunque haya ocurrido un error interno, es posible que Firebase haya procesado la solicitud si el correo es válido.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              // Navegar a /auth DESPUÉS de que el usuario presione OK
              this.router.navigate(['/auth']);
            }
          }
        ]
      });
      await alert.present();
    }
  }

  // El método presentToast sigue siendo útil
  async presentToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    toast.present();
  }

  // El método presentAlert original podría no ser necesario para este flujo específico
  // si todas las alertas de submit ahora tienen navegación, pero puedes conservarlo
  // por si lo usas en otros contextos donde no necesitas un handler de navegación.
  // async presentAlert(header: string, message: string) {
  //   const alert = await this.alertController.create({
  //     header,
  //     message,
  //     buttons: ['OK'],
  //   });
  //   await alert.present();
  // }
}