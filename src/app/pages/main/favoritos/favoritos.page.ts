import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Receta } from 'src/app/models/receta.model';
import { FavoritosService } from 'src/app/services/favoritos.service';
import { RecipesService } from 'src/app/services/recipes.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
})

export class FavoritosPage implements OnInit {
  favoritos: Receta[] = []; //Array para almacenar la lista de recetas favoritas del usuario.

   /**
   * Constructor de la clase. Se utiliza para la inyección de dependencias.
   * @param router Servicio de Angular para la navegación.
   * @param favoritosService Servicio personalizado para gestionar los favoritos.
   * @param recipesService Servicio personalizado para obtener datos de recetas.
   * @param utilsSvc Servicio personalizado para utilidades de UI.
   */
  constructor(
    private router: Router,
    public favoritosService: FavoritosService,
    private recipesService: RecipesService,
    private utilsSvc: UtilsService) {
  }

  /**
 * @function ngOnInit
 * @description Método del ciclo de vida de Angular que se ejecuta una sola vez al iniciar el componente.
 * En este caso, no realiza ninguna acción específica.
 * @returns {void}
 */
  ngOnInit(): void { }

  /**
 * @function ionViewWillEnter
 * @description Método del ciclo de vida de Ionic que se ejecuta cada vez que la vista está por mostrarse.
 * Carga los favoritos almacenados en el servicio y actualiza la lista local.
 * @returns {void}
 */
  ionViewWillEnter() {
    this.favoritosService.loadFavoritos();
    this.favoritos = this.favoritosService.getFavoritos();
  }

  // =================================================================================================
  // Public Methods (accesibles desde el template)
  // =================================================================================================


  /**
 * @function eliminarFavorito
 * @description Elimina una receta de la lista de favoritos usando el servicio correspondiente,
 * y actualiza la lista local.
 * @param {Receta} favorito - Receta que se desea eliminar de favoritos.
 * @returns {void}
 */
  eliminarFavorito(favorito: Receta){
    this.favoritosService.toggleFavorito(favorito); // Llama al servicio para cambiar el estado de favorito de la receta.
    this.favoritos = this.favoritosService.getFavoritos(); // Actualiza la lista local de favoritos para reflejar el cambio en la UI.
  }

  /**
 * @function getRecipeInfo
 * @description Solicita información detallada de una receta al servicio y navega a la vista de detalles.
 * @param {number} id - ID de la receta para obtener su información.
 * @returns {void}
 */
  getRecipeInfo(id: number) {
    this.recipesService.getRecipeInformation(id).subscribe({ // Llama al servicio para obtener los detalles completos de la receta por su ID.
      next: data => {  // Bloque 'next': se ejecuta cuando la llamada a la API es exitosa y devuelve datos.
        this.recipesService.setRecetaSeleccionada(data); // Guarda la receta seleccionada en el servicio RecipesService.
        this.router.navigate(['/main/receta', id]);   // Navega a la página de detalles de la receta.    
      },
       // Bloque 'error': se ejecuta si ocurre un error durante la llamada a la API.
      error: err => {
        console.error('Error al obtener información de la receta:', err);
        this.utilsSvc.presentToast({ message: 'Error al obtener detalles de la receta.', duration: 3000, color: 'danger' });
      }
    });
  }

}
