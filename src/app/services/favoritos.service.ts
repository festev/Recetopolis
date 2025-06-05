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
    
    // Primero se intenta cargar del localStorage
    const localDataRaw = localStorage.getItem('userData');
    if (localDataRaw) {
      try {
        const userData = JSON.parse(localDataRaw);
        const favoritosRaw = userData.favoritos ?? [];
      
        if (favoritosRaw.length > 0) {
          this.favoritos = favoritosRaw.map((r: any) => new Receta(r));
          console.log("Favoritos cargados desde localStorage:", this.favoritos);
          return;
        }
      } catch (e) {
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
