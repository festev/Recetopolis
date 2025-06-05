import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Receta } from 'src/app/models/receta.model';
import { FavoritosService } from 'src/app/services/favoritos.service';
import { RecipesService } from 'src/app/services/recipes.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-receta',
  templateUrl: './receta.page.html',
  styleUrls: ['./receta.page.scss'],
})
export class RecetaPage implements OnInit {

  receta: Receta;
  esFavorito: boolean = false;

  constructor(
    public activatedRoute: ActivatedRoute,
    public recipesService: RecipesService,
    public favoritosService: FavoritosService,
    public utilsSvc: UtilsService
  ) { }

  /**
 * @function ngOnInit
 * @description Método del ciclo de vida de Angular que se ejecuta al iniciar el componente. 
 * Obtiene el ID de la receta desde la URL y carga la receta seleccionada desde el service.
 * Si el ID es inválido o no hay receta en el service, redirige a la página de inicio.
 * @returns {void}
 */
  ngOnInit() {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam) : null;

    if (!id) {
      this.utilsSvc.presentToast({ message: 'ID inválido', duration: 2000, color: 'danger' });
      this.utilsSvc.routerLink('/main/home');
      return;
    }

    const seleccionada = this.recipesService.getRecetaSeleccionada();
    
    if (seleccionada && seleccionada.id === id) {
      this.receta = seleccionada;
      this.esFavorito = this.favoritosService.isFavorito(this.receta.id);
    } else {
        console.error('Error al cargar receta: la receta no está en el service o no coincide con el id del url');
        this.utilsSvc.presentToast({ message: 'Error al cargar la receta.', duration: 2500, color: 'danger' });
        this.utilsSvc.routerLink('/main/home');
    }
  }

  /**
 * @function cambiarFavorito
 * @description Alterna el estado de favorito de la receta actual usando el servicio de favoritos.
 * @returns {void}
 */
  cambiarFavorito() {
    this.favoritosService.toggleFavorito(this.receta);
    this.esFavorito = this.favoritosService.isFavorito(this.receta.id);
  }

  /**
 * @function ionViewWillLeave
 * @description Método de ciclo de vida de Ionic que se ejecuta al abandonar la vista. Limpia la receta seleccionada en el servicio.
 * @returns {void}
 */
  ionViewWillLeave() { //cada vez que se sale de la página (no importa que), la recetaSeleccionada (del service) se vacía
    this.recipesService.setRecetaSeleccionada(null);
  }

}
