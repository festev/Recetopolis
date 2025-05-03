import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';  
import { Observable } from 'rxjs';  

@Injectable({  
 providedIn: 'root'  
})  
export class RecipesService {  
    private apiKey = 'aff7fdd4b80c4563a585af707c224d6e';  

    constructor(private http: HttpClient) { }  
  
    getRecipesByIngredients(ingredients: string, number: number): Observable<any> {  
      return this.http.get(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${number}&apiKey=${this.apiKey}`);  
    }  
  
    getRecipeInformation(id: number): Observable<any> {  
      return this.http.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${this.apiKey}`);  
    }  
}