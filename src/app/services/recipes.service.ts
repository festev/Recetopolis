import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';  
import { map, Observable, tap } from 'rxjs';  

import { Receta, RecetaLista } from 'src/app/models/receta.model';

@Injectable({  
 providedIn: 'root'  
})  
export class RecipesService {  
  private apiKey = 'e7c9d8eed7d54fdba216cf4b243d515d';
  private recetasBuscadas: RecetaLista[] = [];
  private recetaSeleccionada: Receta | null = null;

  constructor(private http: HttpClient) { }  

  getRecipesByIngredients(ingredients: string, number: number): Observable<RecetaLista[]> {  
    return this.http.get<any[]>(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${number}&apiKey=${this.apiKey}`)
    .pipe(
      map(response => response.map(data => new RecetaLista(data))),
      tap(recetas => this.recetasBuscadas = recetas)
    );
  }  

  getRecipeInformation(id: number): Observable<Receta> {  
    return this.http.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${this.apiKey}`)
    .pipe(
      map(data => new Receta(data)),
      tap(receta => this.recetaSeleccionada = receta)
    );
  }

  getRecetasBuscadas(): RecetaLista[] {
    return this.recetasBuscadas;
  }

  getRecetaSeleccionada(): Receta | null {
    return this.recetaSeleccionada;
  }

  setRecetaSeleccionada(receta: Receta) {
    this.recetaSeleccionada = receta;
  }

}