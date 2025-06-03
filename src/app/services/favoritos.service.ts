import { inject, Injectable } from '@angular/core';
import { Receta } from '../models/receta.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {
  private favoritos: Receta[] = [];

  constructor() {
    this.loadFavoritos();
  }

    firebaseSvc = inject(FirebaseService);

  async loadFavoritos(): Promise<void> {

    try {
      const uid = this.firebaseSvc.getAuth().currentUser?.uid;

      const userDoc = await this.firebaseSvc.getDocument(`users/${uid}`);
      const favoritosRaw = userDoc?.['favoritos'] ?? [];

      this.favoritos = favoritosRaw.map((r: any) => new Receta(r));

      // Guardamos en localStorage como respaldo
      const userDataRaw = localStorage.getItem('userData');
      const userData = userDataRaw ? JSON.parse(userDataRaw) : {};
      userData.favoritos = favoritosRaw;
      localStorage.setItem('userData', JSON.stringify(userData));

      console.log("Favoritos cargados desde Firestore:", this.favoritos);
    } catch (error) {
        console.warn("No se pudo cargar desde Firestore. Usando localStorage.");

        // Fallback: localStorage
        const data = localStorage.getItem('userData');
        if (data) {
          try {
            const userData = JSON.parse(data);
            const favoritosRaw = userData.favoritos ?? [];

            this.favoritos = favoritosRaw.map((r: any) => new Receta(r));
          } catch (e) {
            console.error('Error al cargar favoritos desde localStorage:', e);
            this.favoritos = [];
          }
        }
      }

    /*const data = localStorage.getItem('userData');
    if (data) {
      try {
        const userData = JSON.parse(data);
        const favoritosRaw = userData.favoritos ?? [];

        this.favoritos = favoritosRaw.map((r: any) => new Receta(r));
      } catch (e) {
        console.error('Error al cargar favoritos:', e);
        this.favoritos = [];
      }
    }*/
    console.log("loadFavoritos(): " + this.favoritos);
  }

  toggleFavorito(receta: Receta): void {
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

  private async saveFavoritos(): Promise<void> {
    const userDataRaw = localStorage.getItem('userData');
    let userData = userDataRaw ? JSON.parse(userDataRaw) : {};

    const favoritosPlano = this.favoritos.map(f => f.toJson()); 
    userData.favoritos = favoritosPlano;
    
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

  isFavorito(id: number): boolean {
    console.log("isFavorito(): " + this.favoritos.some(fav => fav.id === id));
    return this.favoritos.some(fav => fav.id === id);
  }

  getFavoritos(): Receta[] {
    return [...this.favoritos];
  }

}
