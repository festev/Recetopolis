import { Injectable } from '@angular/core';
import { Receta } from '../models/receta.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {
  private favoritos: Receta[] = [];

  constructor() {
    this.loadFavoritos();
  }

  private loadFavoritos(): void {
    const data = localStorage.getItem('favoritos');
    if (data) {
      try {
        const raw = JSON.parse(data);
        this.favoritos = raw.map((r: any) => new Receta(r));
      } catch (e) {
        console.error('Error al cargar favoritos:', e);
        this.favoritos = [];
      }
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

  private saveFavoritos(): void {
    localStorage.setItem('favoritos', JSON.stringify(this.favoritos));
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
