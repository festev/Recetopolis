import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service'; // Ajusta la ruta si es diferente
import { UtilsService } from 'src/app/services/utils.service';   // Ajusta la ruta si es diferente
import { User } from 'firebase/auth'; // Importa el tipo User de Firebase


@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  currentUser: User | null = null;
  displayName: string = '';
  //email: string = ''; // El email generalmente se muestra, pero su edición es más compleja

  constructor() { }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const user = this.firebaseSvc.getAuth().currentUser;
    if (user) {
      this.currentUser = user;
      this.displayName = user.displayName || '';
      // this.email = user.email || ''; // El email del usuario
    } else {
      // Esto no debería ocurrir si la página está protegida por un guard de autenticación
      console.warn('Usuario no encontrado al cargar el perfil.');
      this.utilsSvc.presentToast({
        message: 'No se pudieron cargar los datos del usuario.',
        color: 'danger',
        duration: 3000
      });
      // Podrías redirigir al login si es necesario
      // this.router.navigate(['/login']);
    }
  }

  async saveProfile() {
    if (!this.currentUser) {
      this.utilsSvc.presentToast({ message: 'Error: Usuario no autenticado.', color: 'danger' });
      return;
    }

    // Validar que el displayName no esté vacío (puedes añadir más validaciones)
    if (!this.displayName || this.displayName.trim() === '') {
      this.utilsSvc.presentToast({ message: 'El nombre no puede estar vacío.', color: 'warning' });
      return;
    }

    const loading = await this.utilsSvc.loading('Guardando cambios...');
    await loading.present();

    try {
      // Llama a un método en tu FirebaseService para actualizar el perfil
      // Este método debería usar updateProfile de Firebase Auth
      await this.firebaseSvc.updateUser(this.displayName.trim());

      // Actualiza el objeto currentUser localmente si es necesario (Firebase Auth lo hace internamente también)
      // this.currentUser.displayName = this.displayName.trim(); // Firebase actualiza el objeto currentUser automáticamente

      this.utilsSvc.presentToast({
        message: 'Perfil actualizado exitosamente.',
        color: 'success',
        duration: 2000
      });
    } catch (error: any) {
      console.error('Error al actualizar el perfil:', error);
      this.utilsSvc.presentToast({
        message: `Error: ${error.message || 'No se pudo actualizar el perfil.'}`,
        color: 'danger',
        duration: 3000
      });
    } finally {
      await loading.dismiss(); // Oculta el indicador de carga
    }
  }

}
