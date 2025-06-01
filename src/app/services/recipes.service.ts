import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';  
import { map, Observable, tap } from 'rxjs';  

import { Receta, RecetaLista } from 'src/app/models/receta.model';

@Injectable({  
 providedIn: 'root'  
})  
export class RecipesService {  
    private apiKey = 'aff7fdd4b80c4563a585af707c224d6e';  

    constructor(private http: HttpClient) { }  
  
    getRecipesByIngredients(ingredients: string, number: number): Observable<RecetaLista[]> {  
      return this.http.get<any[]>(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${number}&apiKey=${this.apiKey}`)
      .pipe(
        map(response =>
          response.map(data => new RecetaLista(data)))
      );
    }  
  
    getRecipeInformation(id: number): Observable<Receta> {  
      return this.http.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${this.apiKey}`)
      .pipe(
        map(data => new Receta(data))
      );
    }  
}