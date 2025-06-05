// Angular Core Imports: Decoradores y funciones esenciales de Angular.
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router'; // Servicio de Angular para la navegación programática.
// Ionic Angular Imports: Controladores para componentes de UI como loaders y toasts.
import { LoadingController, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadingCtrl = inject(LoadingController) // Controlador para crear y manejar indicadores de carga (spinners)
  toasCtrl = inject(ToastController) // Controlador para crear y mostrar mensajes emergentes (toasts).
  router = inject(Router) // Servicio de Angular para controlar la navegación entre rutas.

  /**
   * @function loading
   * @description Crea y devuelve un controlador de loading con un spinner y mensaje opcional.
   * @param {string} [message] - Mensaje opcional que se mostrará en el loading.
   * @returns {Promise<HTMLIonLoadingElement>} Promesa con el componente de loading creado.
   */
  loading(message?: string) { // El parámetro 'message' es opcional.
    return this.loadingCtrl.create({ 
      spinner: 'crescent', // Tipo de spinner (puedes cambiarlo por otros como 'dots', 'lines', etc.).
      message: message // Mensaje que se muestra durante la carga.
    });
  }

   /**
   * @function presentToast
   * @description Muestra un toast con las opciones proporcionadas.
   * @param {ToastOptions} [opts] - Opciones de configuración del toast.
   * @returns {Promise<void>} Promesa que se resuelve cuando el toast se presenta.
   */
  async presentToast(opts?: ToastOptions) {
      // Crea el toast con las opciones proporcionadas.
    const toast = await this.toasCtrl.create(opts);
    toast.present(); //// Muestra el toast.
  }

    /**
   * @function routerLink
   * @description Redirige a la ruta proporcionada usando el router de Angular.
   * @param {string} url - Ruta a la que se desea navegar.
   * @returns {Promise<boolean>} Promesa que indica si la navegación fue exitosa.
   */
  routerLink(url: string) {
    return this.router.navigateByUrl(url);

  }

   /**
   * @function saveInLocalStorage
   * @description Guarda un valor en el localStorage usando una clave específica.
   * @param {string} key - Clave bajo la cual se guardará el valor.
   * @param {any} value - Valor a guardar (se serializa en JSON).
   * @returns {void}
   */
  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));

  }
  
  /**
   * @function getFromLocalStorage
   * @description Recupera y parsea un valor desde localStorage usando su clave.
   * @param {string} key - Clave del valor a recuperar.
   * @returns {any} El valor almacenado, parseado desde JSON. Devuelve null si no existe.
   */
  getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key));

  }

}
