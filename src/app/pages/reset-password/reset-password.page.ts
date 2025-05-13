// src/app/pages/reset-password/reset-password.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
// import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  token: string | null = null;
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
    // private authService: AuthService // Descomenta si tienes un servicio
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    if (!this.token) {
      console.error('Token no encontrado en la URL');
      this.presentToast('Token inválido o no proporcionado.', 'danger');
      this.router.navigate(['/auth']); // Redirigir si no hay token
    }
  }

  async onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.presentToast('Las contraseñas no coinciden.', 'warning');
      return;
    }
    if (!this.token) {
      this.presentToast('Token no válido. No se puede restablecer la contraseña.', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Restableciendo contraseña...',
    });
    await loading.present();

    try {
      // --- INICIO: LÓGICA DE BACKEND (EJEMPLO/SIMULACIÓN) ---
      // Aquí llamarías a tu servicio de backend.
      // Por ejemplo: await this.authService.resetPassword(this.token, this.password);

      // Simulación de llamada a backend:
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Contraseña restablecida para el token:', this.token, 'Nueva contraseña:', this.password);
      // En un caso real, el backend validaría el token y actualizaría la contraseña.
      // --- FIN: LÓGICA DE BACKEND ---

      await loading.dismiss();
      this.presentAlert(
        'Contraseña Restablecida',
        'Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.'
      );
      this.router.navigate(['/auth']); // Redirige al login
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error al restablecer la contraseña:', error);
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
