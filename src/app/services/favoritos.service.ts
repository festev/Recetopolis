// Angular Core Imports: Decoradores y funciones esenciales de Angular.
import { inject, Injectable } from '@angular/core';
// Model Imports: Modelos de datos de la aplicación.
import { Receta } from '../models/receta.model';
import { FirebaseService } from './firebase.service';

/**
 * Servicio que gestiona la lógica de recetas favoritas.
 * Se instancia como singleton en toda la app.
 */
@Injectable({ //Decorator: Marca la clase como un servicio que puede ser inyectado.
  providedIn: 'root',
})
export class FavoritosService {
  private favoritos: Receta[] = []; //Array privado que almacena la lista de objetos Receta marcados como favoritos.

  // =================================================================================================
  // Constructor
  // =================================================================================================

  constructor() {
    this.loadFavoritos(); //cargar los favoritos previamente guardados en LocalStorage, en caso de no estar el localStorage, los trae del Firestore
  }

    firebaseSvc = inject(FirebaseService);

  // =================================================================================================
  // Private Methods (Gestión interna de LocalStorage y Firestore)
  // =================================================================================================

    /**
   * @function loadFavoritos
   * @description Carga los favoritos del usuario desde el localStorage. Si no hay datos válidos, intenta cargarlos desde Firestore.
   * @returns {Promise<void>} Una promesa que se resuelve cuando la carga ha finalizado.
   */
  async loadFavoritos(): Promise<void> {
    
    // Primero se intenta cargar del localStorage
    const localDataRaw = localStorage.getItem('userData');
    if (localDataRaw) {
      try {
        const userData = JSON.parse(localDataRaw);
        const favoritosRaw = userData.favoritos ?? [];
      
        if (favoritosRaw.length > 0) {
          // Mapea cada objeto 'crudo' a una nueva instancia de la clase Receta.
          this.favoritos = favoritosRaw.map((r: any) => new Receta(r));
          console.log("Favoritos cargados desde localStorage:", this.favoritos);
          return;
        }
      } catch (e) {
        // Si ocurre un error durante el parseo (ej. datos corruptos)
        console.log('No se pudo leer favoritos desde localStorage:', e);
      }
    }

    // Si localStorage está vacío o inválido, se intenta cargar desde Firestore

    try {
      const uid = this.firebaseSvc.getAuth().currentUser?.uid;
      if (!uid) throw new Error("Usuario no autenticado");

        const userDoc = await this.firebaseSvc.getDocument(`users/${uid}`);
        const favoritosRaw = userDoc?.['favoritos'] ?? [];

        this.favoritos = favoritosRaw.map((r: any) => new Receta(r));

        // Guardamos en localStorage como respaldo
        const userData = localDataRaw ? JSON.parse(localDataRaw) : {};
        userData.favoritos = this.favoritos.map((r: Receta) => r.toJson());
        localStorage.setItem('userData', JSON.stringify(userData));

      console.log("Favoritos cargados desde Firestore:", this.favoritos);
    } catch (error) {
        console.warn("No se pudo cargar ningún favorito.");
        this.favoritos = [];
      }

    console.log("loadFavoritos(): " + this.favoritos);
  }

    /**
   * @function saveFavoritos
   * @description Guarda la lista actual de favoritos en localStorage y la sincroniza con Firestore.
   * @returns {Promise<void>} Una promesa que se resuelve cuando la operación ha finalizado.
   */
  private async saveFavoritos(): Promise<void> {
    const userDataRaw = localStorage.getItem('userData');
    let userData = userDataRaw ? JSON.parse(userDataRaw) : {};

    const favoritosPlano = this.favoritos.map(f => f.toJson()); 
    userData.favoritos = favoritosPlano;
    
     // Guarda el array 'favoritos' en LocalStorage, convirtiéndolo a string JSON.
    localStorage.setItem('userData', JSON.stringify(userData));

    try {
      const uid = this.firebaseSvc.getAuth().currentUser.uid;
      if (!uid) throw new Error("Usuario no autenticado");

      await this.firebaseSvc.setDocument(`users/${uid}`, { favoritos: favoritosPlano }, true);
    } catch (error) {
      console.error("Error guardando favoritos en Firestore:", error);
    }

    console.log("saveFavoritos(): " + this.favoritos);
  }

  // =================================================================================================
  // Public Methods (API del Servicio)
  // =================================================================================================

     /**
   * @function toggleFavorito
   * @description Agrega o quita una receta de la lista de favoritos. Luego guarda los cambios en localStorage y Firestore.
   * @param {Receta} receta - La receta que se desea agregar o quitar de favoritos.
   * @returns {void}
   */
  toggleFavorito(receta: Receta): void {
      // Busca el índice de la receta en el array de favoritos basado en su ID.
    const index = this.favoritos.findIndex(fav => fav.id === receta.id);
    if (index !== -1) {
      // Ya existe, lo quitamos
      this.favoritos.splice(index, 1);
    } else {
      // No existe, lo agregamos
      this.favoritos.push(receta);
    }
    this.saveFavoritos();
  }

  /**
   * @function isFavorito
   * @description Verifica si una receta está marcada como favorita.
   * @param {number} id - El ID de la receta a verificar.
   * @returns {boolean} `true` si la receta está en favoritos, `false` en caso contrario.
   */
  isFavorito(id: number): boolean {
    console.log("isFavorito(): " + this.favoritos.some(fav => fav.id === id));
    return this.favoritos.some(fav => fav.id === id);
  }

    /**
   * @function getFavoritos
   * @description Devuelve una copia de la lista de recetas favoritas.
   * @returns {Receta[]} Un array con las recetas favoritas actuales.
   */
  getFavoritos(): Receta[] {
    // Devuelve una copia del array de favoritos para proteger el estado interno del servicio.
    return [...this.favoritos];
  }

}
