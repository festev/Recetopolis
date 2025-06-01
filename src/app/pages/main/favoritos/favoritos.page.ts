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
  favoritos: Receta[] = [];

  constructor(
    private router: Router,
    public favoritosService: FavoritosService,
    private recipesService: RecipesService,
    private utilsSvc: UtilsService) {
  }
  
  ngOnInit(): void { }

  ionViewWillEnter() {
    this.favoritos = this.favoritosService.getFavoritos();
  }

  eliminarFavorito(favorito: Receta){
    this.favoritosService.toggleFavorito(favorito);
    this.favoritos = this.favoritosService.getFavoritos();
  }

  getRecipeInfo(id: number) {
    this.recipesService.getRecipeInformation(id).subscribe({
      next: data => {
        this.recipesService.setRecetaSeleccionada(data);
        this.router.navigate(['/receta', id]);       
      },
      error: err => {
        console.error('Error al obtener información de la receta:', err);
        this.utilsSvc.presentToast({ message: 'Error al obtener detalles de la receta.', duration: 3000, color: 'danger' });
      }
    });
  }

}
