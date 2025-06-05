import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'firebase/auth';
import { Geolocation, Position } from '@capacitor/geolocation'; // Position no se usa, podría quitarse
import { GeoPoint } from 'firebase/firestore';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ActionSheetController } from '@ionic/angular';
import { UserAuth, UserData } from 'src/app/models/user.model';
import { Receta } from 'src/app/models/receta.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss']
})
export class EditProfilePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  actionSheetCtrl = inject(ActionSheetController);

  userAuth: UserAuth;
  userData: UserData;

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
    const userAuthRaw = localStorage.getItem('userAuth');
    const userDataRaw = localStorage.getItem('userData');

    if(userAuthRaw && userDataRaw){
      this.userAuth = JSON.parse(userAuthRaw) as UserAuth;
      const parsed = JSON.parse(userDataRaw);
      const favoritos = (parsed.favoritos || []).map((r: any) => new Receta(r));

      this.userData = {
      ...parsed,
      favoritos,
      } as UserData;

    } else {
      this.userAuth = this.firebaseSvc.getAuth().currentUser as UserAuth;
      try{
        const userDoc = await this.firebaseSvc.getDocument(`users/${this.userAuth.uid}`) as UserData;
        const favoritos = (userDoc?.favoritos || []).map((r: any) => new Receta(r));

        this.userData = {
        ...userDoc,
        favoritos
        } as UserData;
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    }
    if (this.userAuth) {
      this.displayName =  this.userAuth.displayName || '';
      this.profileImageUrl = this.userAuth.photoURL;

      try {
        if (this.userData) {
          this.bio = this.userData.bio || '';
          this.phoneNumber = this.userData.phoneNumber || '';

          const firestoreLocation = this.userData.location;
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
    if (!this.userAuth) {
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
      console.log('saveProfile: Intentando actualizar imageUrl...'); // <--- LOG AÑADIDO
      await this.firebaseSvc.updatePhotoUrl(this.profileImageUrl.substring(0, 200));
      console.log('saveProfile: Auth photoURL actualizado (o no hubo error).'); // <--- LOG AÑADIDO

      if (this.location && typeof this.location.latitude === 'number' && typeof this.location.longitude === 'number') {
        this.userData.location = new GeoPoint(this.location.latitude, this.location.longitude);
        console.log('saveProfile: GeoPoint para ubicación creado:', this.userData.location); // <--- LOG AÑADIDO
      }
      this.userAuth.displayName = this.displayName.trim();
      this.userAuth.photoURL = this.profileImageUrl;
      this.userData.bio = this.bio;
      this.userData.phoneNumber = this.phoneNumber;
      const userDataToSave = {
      ...this.userData,
      favoritos: this.userData.favoritos.map(fav => fav.toJson ? fav.toJson() : fav)};

      localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
      localStorage.setItem('userData', JSON.stringify(userDataToSave));

      const userDocPath = `users/${this.userAuth.uid}`;
      console.log('saveProfile: Intentando guardar/actualizar documento en Firestore en la ruta:', userDocPath); // <--- LOG AÑADIDO
      console.log('saveProfile: Datos a guardar en Firestore:', JSON.stringify(this.userData)); // <--- LOG AÑADIDO (JSON.stringify para ver mejor el objeto)
      await this.firebaseSvc.setDocument(userDocPath, userDataToSave, true);
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
        quality: 10,
        allowEditing: false, // O true si quieres que el usuario pueda recortar
        resultType: CameraResultType.Base64, // Nos da una URL web para la vista previa (webPath)
        source: source
      });

      // image.webPath será la URL para mostrar en <img src="...">
      if (image.base64String) {
        this.profileImageUrl = `data:image/jpeg;base64,${image.base64String}`;
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