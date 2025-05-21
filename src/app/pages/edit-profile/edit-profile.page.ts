import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'firebase/auth';
import { Geolocation, Position } from '@capacitor/geolocation';
import { GeoPoint } from 'firebase/firestore'; // Asegúrate que esta importación esté


@Component({
  selector: 'app-edit-profile', // CORREGIDO: Quitar './' del selector
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


  mapImageUrl: string | null = null;
  private googleMapsApiKey: string = 'AIzaSyCeonSSeyfThckKZChFdHtK-rkDagNu4PQ';


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
          const firestoreLocation = userData['location'];
          if (firestoreLocation && typeof firestoreLocation.latitude === 'number' && typeof firestoreLocation.longitude === 'number') {
            this.location = {
              latitude: firestoreLocation.latitude,
              longitude: firestoreLocation.longitude
            };
            this.updateMapImageUrl();
          }
        }
      } catch (error) {
        console.error("Error cargando datos del perfil desde Firestore:", error);
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
  updateMapImageUrl() {
    if (this.location && typeof this.location.latitude === 'number' && typeof this.location.longitude === 'number') {

      if (!this.googleMapsApiKey || this.googleMapsApiKey === 'TU_CLAVE_API_DE_Maps_AQUI' || this.googleMapsApiKey === 'TU_CLAVE_API_DE_Maps_AQUI') {
        console.warn('Clave API de Google Maps no configurada para mostrar el mapa.');
        this.mapImageUrl = null;
        return;
      }
      const lat = this.location.latitude;
      const lng = this.location.longitude;
      const zoom = 15;
      const width = 600; // Ancho de la imagen del mapa (puedes ajustarlo)
      const height = 300; // Alto de la imagen del mapa

      this.mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${this.googleMapsApiKey}`;

    } else {
      this.mapImageUrl = null;
    }
    console.log('Generated mapImageUrl:', this.mapImageUrl);
  }

  async saveProfile() {
    if (!this.currentUser) {
      this.utilsSvc.presentToast({ message: 'Error: Usuario no autenticado.', color: 'danger' });
      return;
    }

    if (!this.displayName || this.displayName.trim() === '') {
      this.utilsSvc.presentToast({ message: 'El nombre no puede estar vacío.', color: 'warning' });
      return;
    }

    const loading = await this.utilsSvc.loading('Guardando cambios...');
    await loading.present();

    try {
      // 1. Actualizar perfil de Autenticación (displayName)
      await this.firebaseSvc.updateUser(this.displayName.trim());

      // 2. Preparar datos para Firestore
      // === CORRECCIÓN AQUÍ: Definir el tipo para userProfileData ===
      const userProfileData: {
        displayName: string;
        bio: string;
        phoneNumber: string;
        email: string | null | undefined; // email puede ser null o undefined desde currentUser
        location?: GeoPoint | null; // Hacer 'location' opcional y permitir null
      } = {
        displayName: this.displayName.trim(),
        bio: this.bio.trim(),
        phoneNumber: this.phoneNumber.trim(),
        email: this.currentUser?.email, // Usar optional chaining es bueno aquí
        // No inicializamos 'location' aquí, se añadirá condicionalmente
      };
      // =============================================================

      if (this.location && typeof this.location.latitude === 'number' && typeof this.location.longitude === 'number') {
        userProfileData.location = new GeoPoint(this.location.latitude, this.location.longitude);
      } else {
        // Si quieres explícitamente enviar 'null' para borrar la ubicación en Firestore,
        // o si quieres asegurarte de que el campo 'location' exista en el objeto incluso si es null:
        // userProfileData.location = null;
        // Si no haces nada aquí y this.location no cumple la condición,
        // la propiedad 'location' no se enviará en el objeto userProfileData (a menos que la inicialices arriba).
        // Con { merge: true } en setDocument, si 'location' no está en userProfileData,
        // el campo 'location' en Firestore no se modificará.
        // Si envías userProfileData.location = null con {merge: true}, el campo en Firestore se establecerá a null.
      }

      // 3. Guardar/Actualizar datos en Firestore (usando merge)
      const userDocPath = `users/${this.currentUser.uid}`; // Ya verificamos que currentUser no es null
      await this.firebaseSvc.setDocument(userDocPath, userProfileData, true);

      this.utilsSvc.presentToast({
        message: 'Perfil actualizado exitosamente.',
        color: 'success',
        duration: 2000
      });
    } catch (error: any) {
      console.error('saveProfile: Error al actualizar el perfil:', error);
      this.utilsSvc.presentToast({
        message: `Error: ${error.message || 'No se pudo actualizar el perfil.'}`,
        color: 'danger',
        duration: 3000
      });
    } finally {
      await loading.dismiss();
    }
  }

  async getCurrentLocation() {
    this.isFetchingLocation = true;
    this.mapImageUrl = null;
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      this.location = {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
      };

      console.log('Location from GPS:', this.location);

      this.updateMapImageUrl(); // <-- Generar URL del mapa con nueva ubicación
      this.utilsSvc.presentToast({ message: 'Ubicación obtenida.', color: 'success', duration: 1500 });
    } catch (error: any) {
      // ... (tu manejo de error existente) ...
      this.location = null; // Limpiar ubicación si falla
      console.log('Location set to null due to GPS error.');
      this.updateMapImageUrl(); // Asegurarse que la imagen del mapa se limpie
    } finally {
      this.isFetchingLocation = false;
    }
  }
}

/*
this.utilsSvc.presentToast({ message: 'Ubicación obtenida.', color: 'success', duration: 1500 });
} catch (error: any) {
console.error('Error obteniendo la ubicación:', error);
let errorMessage = 'No se pudo obtener la ubicación.';
if (error.message && error.message.toLowerCase().includes('permission denied')) {
  errorMessage = 'Permiso de ubicación denegado. Por favor, habilítalo en los ajustes.';
} else if (error.message && error.message.toLowerCase().includes('location unavailable')) {
  errorMessage = 'Ubicación no disponible en este momento.';
}
this.utilsSvc.presentToast({ message: errorMessage, color: 'danger', duration: 3000 });
this.location = null;
} finally {
this.isFetchingLocation = false;
}
}
}*/
