// src/app/pages/forgot-password/forgot-password.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
// import { AuthService } from '../../services/auth.service'; // Asumiendo que tienes un servicio de autenticación

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
    private toastController: ToastController
    // private authService: AuthService // Descomenta si tienes un servicio
  ) { }

  ngOnInit() { }

  async onSubmit() {
    if (!this.email) {
      this.presentToast('Por favor, ingresa tu correo electrónico.', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procesando...',
    });
    await loading.present();

    try {
      // --- INICIO: LÓGICA DE BACKEND (EJEMPLO/SIMULACIÓN) ---
      // Aquí llamarías a tu servicio de backend.
      // Por ejemplo: await this.authService.requestPasswordReset(this.email);

      // Simulación de llamada a backend:
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula demora de red
      console.log('Solicitud de restablecimiento de contraseña para:', this.email);
      // En un caso real, el backend enviaría el correo.
      // --- FIN: LÓGICA DE BACKEND ---

      await loading.dismiss();
      this.presentAlert(
        'Correo Enviado',
        'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en breve.'
      );
      this.router.navigate(['/auth']); // Redirige de vuelta al login o a donde prefieras
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error en la solicitud de restablecimiento:', error);
      let errorMessage = 'Ocurrió un error. Por favor, intenta de nuevo.';
      if (error && error.message) { // Personaliza según la respuesta de tu backend
        errorMessage = error.message;
      }
      this.presentAlert('Error', errorMessage);
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async presentToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    toast.present();
  }
}
