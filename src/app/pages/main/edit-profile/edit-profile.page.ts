import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'firebase/auth';
import { Geolocation, Position } from '@capacitor/geolocation'; // Position no se usa, podría quitarse
import { GeoPoint } from 'firebase/firestore';
// Capacitor Plugins Imports: Para acceder a funcionalidades nativas del dispositivo.
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
// Ionic Imports: Componentes de UI como ActionSheet.
import { ActionSheetController } from '@ionic/angular';
import { UserAuth, UserData } from 'src/app/models/user.model';
import { Receta } from 'src/app/models/receta.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss']
})
export class EditProfilePage implements OnInit {

  firebaseSvc = inject(FirebaseService); // Servicio para interactuar con Firebase (Auth, Firestore, Storage).
  utilsSvc = inject(UtilsService); // Servicio para utilidades (loaders, toasts, navegación).
  actionSheetCtrl = inject(ActionSheetController); // Controlador para mostrar hojas de acción (Action Sheets) de Ionic.

  userAuth: UserAuth;
  userData: UserData;

  displayName: string = ''; // Nombre para mostrar del usuario, enlazado al formulario.
  bio: string = '';  // Biografía del usuario, enlazada al formulario.
  phoneNumber: string = ''; // Número de teléfono del usuario, enlazado al formulario.
  location: { latitude?: number, longitude?: number } | null = null; // Almacena la ubicación del usuario como un objeto con latitud y longitud.
  isFetchingLocation = false;  // Booleano para indicar si se está obteniendo la ubicación (útil para UI).

  mapImageUrl: string | null = null;  // Booleano para indicar si se está obteniendo la ubicación (útil para UI).
  private googleMapsApiKey: string = 'AIzaSyCeonSSeyfThckKZChFdHtK-rkDagNu4PQ';

  profileImageUrl: string | null = null; // URL de la imagen de perfil para mostrar en la UI (puede ser local o remota).

  constructor() { }

    /**
   * @function ngOnInit
   * @description Inicializa el componente y carga los datos del perfil del usuario.
   */
  ngOnInit() {
    this.loadUserProfile();
  }

    /**
   * @function loadUserProfile
   * @description Carga la información del usuario autenticado desde localStorage o desde Firestore.
   * También carga los datos como nombre, foto, bio, teléfono y ubicación.
   * @returns {Promise<void>}
   */
  async loadUserProfile() {
     // Obtiene datos de autenticación y datos del usuario almacenados localmente
    const userAuthRaw = localStorage.getItem('userAuth');
    const userDataRaw = localStorage.getItem('userData');

    if(userAuthRaw && userDataRaw){    // Si existen los datos en localStorage, los utiliza
      this.userAuth = JSON.parse(userAuthRaw) as UserAuth;// Parsea y asigna los datos de autenticación
      const parsed = JSON.parse(userDataRaw);// Parsea los datos del usuario
      const favoritos = (parsed.favoritos || []).map((r: any) => new Receta(r));  // Convierte la lista de favoritos en instancias de Receta

       // Asigna los datos del usuario, incluyendo los favoritos convertidos
      this.userData = {
      ...parsed,
      favoritos,
      } as UserData;

    } else { // Si no hay datos en localStorage, obtiene el usuario actual autenticado desde Firebase
      this.userAuth = this.firebaseSvc.getAuth().currentUser as UserAuth;
      try{ // Intenta obtener el documento del usuario desde Firestore
        const userDoc = await this.firebaseSvc.getDocument(`users/${this.userAuth.uid}`) as UserData;
        const favoritos = (userDoc?.favoritos || []).map((r: any) => new Receta(r));// Convierte los favoritos en instancias de Receta

        this.userData = {  // Asigna los datos obtenidos desde Firestore
        ...userDoc,
        favoritos
        } as UserData;
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    }
    if (this.userAuth) {    // Si hay datos de autenticación válidos
       // Asigna el nombre para mostrar y la URL de la imagen de perfil
      this.displayName =  this.userAuth.displayName || '';
      this.profileImageUrl = this.userAuth.photoURL;

      try {
        if (this.userData) {// Si también hay datos del usuario cargados
          // Asigna la bio y el teléfono del perfil
          this.bio = this.userData.bio || '';
          this.phoneNumber = this.userData.phoneNumber || '';

          // Maneja la ubicación almacenada en Firestore (que debería ser un GeoPoint).
          const firestoreLocation = this.userData.location;
           // Si la ubicación es válida, la asigna al perfil
          if (firestoreLocation && typeof firestoreLocation.latitude === 'number' && typeof firestoreLocation.longitude === 'number') {
            this.location = {
              latitude: firestoreLocation.latitude,
              longitude: firestoreLocation.longitude
            };
            this.updateMapImageUrl(); // Actualiza la imagen del mapa basada en la nueva ubicación
          }
        }
      } catch (error) {
        console.error("Error cargando datos del perfil desde Firestore:", error);
      }
    } else {  // Si no se encuentra un usuario autenticado, muestra advertencia y mensaje
      console.warn('Usuario no encontrado al cargar el perfil.');
      this.utilsSvc.presentToast({
        message: 'No se pudieron cargar los datos del usuario.',
        color: 'danger',
        duration: 3000
      });
    }
  }

    /**
   * @function updateMapImageUrl
   * @description Genera una URL para una imagen estática del mapa de Google con la ubicación actual del usuario.
   */
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
      // Construye la URL para la API de Google Maps Static.
      this.mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${this.googleMapsApiKey}`;
    } else {
      this.mapImageUrl = null;
    }
    console.log('Generated mapImageUrl:', this.mapImageUrl); // Log útil para depuración
  }

    /**
   * @function saveProfile
   * @description Guarda los cambios del perfil del usuario en Firebase Authentication y Firestore.
   * Incluye nombre, bio, teléfono, foto de perfil y ubicación.
   * @returns {Promise<void>}
   */
  async saveProfile() {
    if (!this.userAuth) {  // Verifica que el usuario esté autenticado antes de guardar cambios
      this.utilsSvc.presentToast({ message: 'Error: Usuario no autenticado.', color: 'danger' });
      return;
    }

     // Validación simple para el nombre. Podrían añadirse más validaciones para otros campos.
    if (!this.displayName || this.displayName.trim() === '') {
      this.utilsSvc.presentToast({ message: 'El nombre no puede estar vacío.', color: 'warning' });
      return;
    }

    console.log('saveProfile: Iniciando guardado...');
      // Muestra un loader mientras se realiza el guardado
    const loading = await this.utilsSvc.loading('Guardando cambios...');
    await loading.present();

    try {
      console.log('saveProfile: Intentando actualizar Auth displayName...'); 
      await this.firebaseSvc.updateUser(this.displayName.trim()); // Actualiza el nombre de usuario en Firebase Auth
      console.log('saveProfile: Auth displayName actualizado (o no hubo error).');
      console.log('saveProfile: Intentando actualizar imageUrl...'); 
      await this.firebaseSvc.updatePhotoUrl(this.profileImageUrl.substring(0, 200));   // Limita la URL de la imagen a 200 caracteres y la actualiza en Firebase Auth (esto es como una demostración de que funciona subir al Authenticathor. Pero por temas de ser muy largo el Base64, Firebase no permitía subir todo)
      console.log('saveProfile: Auth photoURL actualizado (o no hubo error).'); 

        // Si hay una ubicación, la convierte a GeoPoint de Firestore.
      if (this.location && typeof this.location.latitude === 'number' && typeof this.location.longitude === 'number') {
        this.userData.location = new GeoPoint(this.location.latitude, this.location.longitude);
        console.log('saveProfile: GeoPoint para ubicación creado:', this.userData.location); 
      }

         // Actualiza el objeto local con los nuevos datos del perfil
      this.userAuth.displayName = this.displayName.trim();
      this.userAuth.photoURL = this.profileImageUrl;
      this.userData.bio = this.bio;
      this.userData.phoneNumber = this.phoneNumber;

       // Prepara los datos para guardar, serializando recetas favoritas si es necesario
      const userDataToSave = {
      ...this.userData,
      favoritos: this.userData.favoritos.map(fav => fav.toJson ? fav.toJson() : fav)};

      // Guarda en localStorage para persistencia rápida
      localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
      localStorage.setItem('userData', JSON.stringify(userDataToSave));

      const userDocPath = `users/${this.userAuth.uid}`;    // Ruta del documento en Firestore
      console.log('saveProfile: Intentando guardar/actualizar documento en Firestore en la ruta:', userDocPath);
      console.log('saveProfile: Datos a guardar en Firestore:', JSON.stringify(this.userData)); 
      await this.firebaseSvc.setDocument(userDocPath, userDataToSave, true); // El 'true' para 'merge' es importante si solo quieres actualizar campos y no sobreescribir todo el documento.
      console.log('saveProfile: Documento en Firestore guardado/actualizado (o no hubo error).');

          // Muestra un toast de éxito al usuario
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

    /**
   * @function getCurrentLocation
   * @description Obtiene la ubicación actual del usuario usando GPS, la guarda en el estado del componente y genera la imagen del mapa.
   * @returns {Promise<void>}
   */
  async getCurrentLocation() {
    this.isFetchingLocation = true; // Indica que se está buscando la ubicación (para UI).
    this.mapImageUrl = null; // Resetea la imagen del mapa mientras se busca.
    try {
      const coordinates = await Geolocation.getCurrentPosition({ // Pide al plugin Geolocation la posición actual
        enableHighAccuracy: true, // Intenta obtener la ubicación con alta precisión.
        timeout: 10000 // Tiempo máximo de espera en milisegundos.
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

    /**
   * @function selectImageSource
   * @description Muestra un Action Sheet para que el usuario elija entre tomar una foto o seleccionar una desde la galería.
   * @returns {Promise<void>}
   */
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

    /**
   * @function takePicture
   * @description Usa la cámara o galería para capturar o seleccionar una imagen de perfil del usuario.
   * @param {CameraSource} source - Fuente de la imagen (Cámara o Galería).
   * @returns {Promise<void>}
   */
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