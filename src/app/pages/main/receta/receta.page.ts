import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Receta } from 'src/app/models/receta.model';
import { RecipesService } from 'src/app/services/recipes.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-receta',
  templateUrl: './receta.page.html',
  styleUrls: ['./receta.page.scss'],
})
export class RecetaPage implements OnInit {

  recetaId!: number;
  receta: Receta;

  constructor(
    private activatedRoute: ActivatedRoute,
    private recipesService: RecipesService,
    private utilsSvc: UtilsService
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.recetaId = +idParam;
        this.cargarReceta(this.recetaId);
      }
    });
  }

   cargarReceta(id: number) {
    this.recipesService.getRecipeInformation(id).subscribe({
      next: data => {
        this.receta = data;
      },
      error: err => {
        console.error('Error al cargar receta:', err);
        this.utilsSvc.presentToast({ message: 'Error al cargar la receta.', duration: 2500, color: 'danger' });
      }
    });
  }

}
