// Angular Core: Decoradores y funciones esenciales de Angular.
import { Injectable } from '@angular/core';
// Angular HTTP Client: Para realizar solicitudes HTTP a APIs externas.
import { HttpClient } from '@angular/common/http';  
// RxJS: Operadores para trabajar con Observables.
import { map, Observable, tap } from 'rxjs';  // map para transformar datos, Observable para flujo asíncrono, tap para efectos secundarios.
// Model Imports: Modelos de datos para la estructura de las recetas.
import { Receta, RecetaLista } from 'src/app/models/receta.model';

/**
 * @Injectable: Marca la clase como servicio inyectable.
 * `providedIn: 'root'` crea una única instancia compartida (singleton) para toda la aplicación.
 */
@Injectable({  
 providedIn: 'root'  
})  
export class RecipesService {  
  private apiKey = 'e7c9d8eed7d54fdba216cf4b243d515d'; //Clave API para acceder a la API de Spoonacular.
  private recetasBuscadas: RecetaLista[] = [];  // Almacena la lista de recetas de la última búsqueda por ingredientes.
  private recetaSeleccionada: Receta | null = null;   // Almacena la información detallada de la receta seleccionada por el usuario.


  /**
   * Constructor del servicio.
   * @param http HttpClient de Angular, inyectado para realizar solicitudes HTTP.
   */
  constructor(private http: HttpClient) { }  //

  // =================================================================================================
  // Public Methods - API Interaction
  // =================================================================================================

   /**
   * @function getRecipesByIngredients
   * @description Obtiene una lista de recetas basadas en los ingredientes proporcionados.
   * @param {string} ingredients - Lista de ingredientes separados por comas.
   * @param {number} number - Número máximo de recetas a obtener.
   * @returns {Observable<RecetaLista[]>} Observable con un array de recetas resumidas.
   */
  getRecipesByIngredients(ingredients: string, number: number): Observable<RecetaLista[]> {  
    return this.http.get<any[]>(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${number}&apiKey=${this.apiKey}`)
    .pipe(
      // Transforma cada elemento del array de respuesta en una instancia de RecetaLista.
      map(response => response.map(data => new RecetaLista(data))),
      // Guarda las recetas transformadas en el estado local antes de devolverlas.
      tap(recetas => this.recetasBuscadas = recetas)
    );
  }  

  /**
   * @function getRecipeInformation
   * @description Obtiene la información completa de una receta a partir de su ID.
   * @param {number} id - ID de la receta.
   * @returns {Observable<Receta>} Observable con los detalles de la receta.
   */
  getRecipeInformation(id: number): Observable<Receta> {  
    return this.http.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${this.apiKey}`)
    .pipe(
      // Transforma la respuesta de la API en una instancia de Receta.
      map(data => new Receta(data)),
      // Guarda la receta detallada en el estado local antes de devolverla.
      tap(receta => this.recetaSeleccionada = receta)
    );
  }

  // =================================================================================================
  // Public Methods - State Management (Getters & Setters)
  // =================================================================================================

   /**
   * @function getRecetasBuscadas
   * @description Devuelve la lista de recetas buscadas almacenadas en memoria.
   * @returns {RecetaLista[]} Lista de recetas resumidas.
   */
  getRecetasBuscadas(): RecetaLista[] {
    return this.recetasBuscadas;
  }

    /**
   * @function getRecetaSeleccionada
   * @description Devuelve la receta actualmente seleccionada.
   * @returns {Receta | null} Receta seleccionada o null si no hay ninguna.
   */
  getRecetaSeleccionada(): Receta | null {
    return this.recetaSeleccionada;
  }

  /**
   * @function setRecetaSeleccionada
   * @description Establece la receta actualmente seleccionada.
   * @param {Receta} receta - La receta a marcar como seleccionada.
   * @returns {void}
   */
  setRecetaSeleccionada(receta: Receta) {
    this.recetaSeleccionada = receta;
  }

}