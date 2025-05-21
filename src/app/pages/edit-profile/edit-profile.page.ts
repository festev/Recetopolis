import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service'; // Ajusta la ruta si es diferente
import { UtilsService } from 'src/app/services/utils.service';   // Ajusta la ruta si es diferente
import { User } from 'firebase/auth'; // Importa el tipo User de Firebase
// Importa GeoPoint si decides usarlo para la ubicación más adelante
// import { GeoPoint } from 'firebase/firestore';


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
  bio: string = '';
  phoneNumber: string = '';

  location: { latitude?: number, longitude?: number } | null = null;
  isFetchingLocation = false;

  constructor() { }

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    const user = this.firebaseSvc.getAuth().currentUser;
    if (user) {
      this.currentUser = user;
      this.displayName = user.displayName || '';

      try {
        const userDocPath = `users/${user.uid}`;
        const userData = await this.firebaseSvc.getDocument(userDocPath);
        if (userData) {
          this.bio = userData['bio'] || '';
          this.phoneNumber = userData['phoneNumber'] || '';
          // Carga aquí otros campos que tengas en Firestore (ej. userData['location'])
        }

      } catch (error) {
        console.error("Error cargando datos del perfil desde Firestore:", error);
        // No necesitas mostrar un toast aquí necesariamente, puede que el documento no exista aún
      }

    } else {
      console.warn('Usuario no encontrado al cargar el perfil.');
      this.utilsSvc.presentToast({
        message: 'No se pudieron cargar los datos del usuario.',
        color: 'danger',
        duration: 3000
      });
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
      // 1. Actualizar perfil de Autenticación (displayName)
      await this.firebaseSvc.updateUser(this.displayName.trim());

      // 2. Preparar datos para Firestore
      const userProfileData = {
        displayName: this.displayName.trim(), // Es bueno guardar el displayName aquí también por consistencia
        bio: this.bio.trim(),
        phoneNumber: this.phoneNumber.trim(),
        email: this.currentUser.email // Guardar email como referencia, aunque no se edite
        // Añade aquí otros campos que quieras guardar en Firestore
      };

      // Si tenemos datos de ubicación, los añadimos (lo veremos en Etapa 2)
      // if (this.location && this.location.latitude && this.location.longitude) {
      //   userProfileData.location = new GeoPoint(this.location.latitude, this.location.longitude);
      // }

      // 3. Guardar/Actualizar datos en Firestore (usando merge)
      const userDocPath = `users/${this.currentUser.uid}`;
      await this.firebaseSvc.setDocument(userDocPath, userProfileData, true); // true para mergeFields
      // Si creaste updateUserDocument: await this.firebaseSvc.updateUserDocument(this.currentUser.uid, userProfileData);

      // 4. Actualizar el objeto currentUser localmente si es necesario

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
  // La función para obtener ubicación irá aquí en la Etapa 2
  // async getCurrentLocation() { /* ... */ }

}
