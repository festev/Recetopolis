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

  cambiarFavorito() {
    this.favoritosService.toggleFavorito(this.receta);
    this.esFavorito = this.favoritosService.isFavorito(this.receta.id);
  }

  ionViewWillLeave() { //cada vez que se sale de la página (no importa que), la recetaSeleccionada (del service) se vacía
    this.recipesService.setRecetaSeleccionada(null);
  }

}
