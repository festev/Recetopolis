import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'firebase/auth';
import { Geolocation, Position } from '@capacitor/geolocation'; // Position no se usa, podría quitarse
import { GeoPoint } from 'firebase/firestore';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  actionSheetCtrl = inject(ActionSheetController);

  currentUser: User | null = null;
  displayName: string = '';
  bio: string = '';
  phoneNumber: string = '';
  location: { latitude?: number, longitude?: number } | null = null;
  isFetchingLocation = false;

  mapImageUrl: string | null = null;
  private googleMapsApiKey: string = 'AIzaSyCeonSSeyfThckKZChFdHtK-rkDagNu4PQ';

  profileImageUrl: string | null = null;

  constructor() { }

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    const user = this.firebaseSvc.getAuth().currentUser;
    if (user) {
      this.currentUser = user;
      this.displayName = user.displayName || '';
      this.profileImageUrl = user.photoURL;

      try {
        const userDocPath = `users/${user.uid}`;
        const userData = await this.firebaseSvc.getDocument(userDocPath);
        if (userData) {
          this.bio = userData['bio'] || '';
          this.phoneNumber = userData['phoneNumber'] || '';
          // Si también guardas photoURL en Firestore y quieres que esa tenga precedencia:
          // if (userData['photoURL']) { this.profileImageUrl = userData['photoURL']; }

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
      if (!this.googleMapsApiKey || this.googleMapsApiKey === 'TU_CLAVE_API_DE_Maps_AQUI') { // Considera simplificar esta condición si tu clave ya está puesta
        console.warn('Clave API de Google Maps no configurada o es placeholder.');
        this.mapImageUrl = null;
        return;
      }
      const lat = this.location.latitude;
      const lng = this.location.longitude;
      const zoom = 15;
      const width = 600;
      const height = 300;
      this.mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${this.googleMapsApiKey}`;
    } else {
      this.mapImageUrl = null;
    }
    console.log('Generated mapImageUrl:', this.mapImageUrl); // Este log ya lo tenías, es útil
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

    console.log('saveProfile: Iniciando guardado...'); // <--- LOG AÑADIDO
    const loading = await this.utilsSvc.loading('Guardando cambios...');
    await loading.present();

    try {
      console.log('saveProfile: Intentando actualizar Auth displayName...'); // <--- LOG AÑADIDO
      await this.firebaseSvc.updateUser(this.displayName.trim());
      console.log('saveProfile: Auth displayName actualizado (o no hubo error).'); // <--- LOG AÑADIDO

      const userProfileData: {
        displayName: string;
        bio: string;
        phoneNumber: string;
        email: string | null | undefined;
        location?: GeoPoint | null;
      } = {
        displayName: this.displayName.trim(),
        bio: this.bio.trim(),
        phoneNumber: this.phoneNumber.trim(),
        email: this.currentUser?.email,
      };

      if (this.location && typeof this.location.latitude === 'number' && typeof this.location.longitude === 'number') {
        userProfileData.location = new GeoPoint(this.location.latitude, this.location.longitude);
        console.log('saveProfile: GeoPoint para ubicación creado:', userProfileData.location); // <--- LOG AÑADIDO
      }

      const userDocPath = `users/${this.currentUser.uid}`;
      console.log('saveProfile: Intentando guardar/actualizar documento en Firestore en la ruta:', userDocPath); // <--- LOG AÑADIDO
      console.log('saveProfile: Datos a guardar en Firestore:', JSON.stringify(userProfileData)); // <--- LOG AÑADIDO (JSON.stringify para ver mejor el objeto)
      await this.firebaseSvc.setDocument(userDocPath, userProfileData, true);
      console.log('saveProfile: Documento en Firestore guardado/actualizado (o no hubo error).'); // <--- LOG AÑADIDO

      this.utilsSvc.presentToast({
        message: 'Perfil actualizado exitosamente.',
        color: 'success',
        duration: 2000
      });
    } catch (error: any) {
      console.error('saveProfile: Error al actualizar el perfil:', error); // Este console.error ya estaba y es MUY IMPORTANTE
      this.utilsSvc.presentToast({
        message: `Error: ${error.message || 'No se pudo actualizar el perfil.'}`,
        color: 'danger',
        duration: 3000
      });
    } finally {
      console.log('saveProfile: Entrando al bloque finally, intentando dismiss loading.'); // <--- LOG AÑADIDO
      await loading.dismiss();
      console.log('saveProfile: Loading dismissed.'); // <--- LOG AÑADIDO
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
      console.log('Location from GPS:', this.location); // Este log ya lo tenías
      this.updateMapImageUrl();
      this.utilsSvc.presentToast({ message: 'Ubicación obtenida.', color: 'success', duration: 1500 });
    } catch (error: any) {
      // El manejo de error que tenías aquí está bien
      console.error('Error obteniendo la ubicación:', error); // Añadido console.error para más detalle
      let errorMessage = 'No se pudo obtener la ubicación.';
      if (error.message && error.message.toLowerCase().includes('permission denied')) {
        errorMessage = 'Permiso de ubicación denegado. Por favor, habilítalo en los ajustes.';
      } else if (error.message && error.message.toLowerCase().includes('location unavailable')) {
        errorMessage = 'Ubicación no disponible en este momento.';
      }
      this.utilsSvc.presentToast({ message: errorMessage, color: 'danger', duration: 3000 });
      this.location = null;
      console.log('Location set to null due to GPS error.'); // Este log ya lo tenías
      this.updateMapImageUrl();
    } finally {
      this.isFetchingLocation = false;
    }
  }
  async selectImageSource() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seleccionar Fuente',
      buttons: [
        {
          text: 'Tomar Foto (Cámara)',
          icon: 'camera',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: 'Elegir de Galería',
          icon: 'image',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePicture(source: CameraSource) {
    console.log('takePicture llamada con source:', source);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false, // O true si quieres que el usuario pueda recortar
        resultType: CameraResultType.Uri, // Nos da una URL web para la vista previa (webPath)
        source: source
      });

      // image.webPath será la URL para mostrar en <img src="...">
      if (image.webPath) {
        this.profileImageUrl = image.webPath;
        // Aquí guardaremos la imagen para subirla después. Por ahora solo la mostramos.
        // this.profileImageFile = await this.convertPathToBlob(image.webPath); // Necesitaremos esta función más adelante
        console.log('Imagen seleccionada (vista previa):', this.profileImageUrl);
      } else {
        console.warn('No se pudo obtener la ruta web de la imagen.');
        this.utilsSvc.presentToast({ message: 'No se pudo obtener la imagen.', color: 'warning' });
      }

    } catch (error) {
      console.error('Error al tomar/seleccionar foto:', error);
      // Comprobar si es error de cancelación del usuario (no es un error real de la app)
      if (error && (error as any).message && (error as any).message.toLowerCase().includes('user cancelled')) {
        // No mostrar toast si el usuario canceló
        return;
      }
      this.utilsSvc.presentToast({ message: 'Error al procesar la imagen.', color: 'danger' });
    }
  }
}