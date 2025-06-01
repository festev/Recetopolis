import { Component, ElementRef, ViewChild, OnInit, OnDestroy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { RecipesService } from 'src/app/recipes.service';
import { Router } from '@angular/router';


// ... (@Component decorator)
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  providers: [DatePipe]
})
export class HomePage implements OnInit, OnDestroy {

  @ViewChild('swiperRef', { read: ElementRef }) swiperRef!: ElementRef;

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  ingredientToAdd: string = '';
  recipes: any[] = [];
  selectedRecipe: any = null;

  currentTime: string | null = '';
  private timerInterval: any;

  items: string[];
  favoritos: Set<{ id: number, sourceUrl: string, foto?: string }> = new Set();

  recetasPorPagina = 7;
  paginaActual = 1;
  recetasAgrupadasPorPagina: any[][] = [];

  constructor(
    private recipesService: RecipesService,
    private router: Router,
    private datePipe: DatePipe
  ) {
    this.items = ['Elemento 1', 'Elemento 2', 'Elemento 3', 'Elemento 4', 'Elemento 5'];
    }

  ngOnInit() {
    this.updateTime();
    this.timerInterval = setInterval(() => {
      this.updateTime();
    }, 1000);

    this.loadFavoritos();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }


  updateTime() {
    const now = new Date();
    // CORREGIDO: Formato del reloj a HH:mm (ej: 21:40)
    this.currentTime = this.datePipe.transform(now, 'HH:mm');
  }

  addIngredient() {
    if (!this.ingredientToAdd.trim()) {
      this.utilsSvc.presentToast({ message: 'Por favor, ingresa un ingrediente.', duration: 2000, color: 'warning' });
      return;
    }
    this.recipesService.getRecipesByIngredients(this.ingredientToAdd, 28).subscribe({
      next: data => {
        this.recipes = data;
        this.selectedRecipe = null;

        setTimeout(() => { //reinicia el slider a la primera página
          if (this.swiperRef?.nativeElement?.swiper) {
            this.swiperRef.nativeElement.swiper.slideTo(0);
          }
        }, 0);

        this.paginaActual = 1;
        this.agruparRecetasPorPagina();

        if (data.length === 0) {
          this.utilsSvc.presentToast({ message: 'No se encontraron recetas para los ingredientes proporcionados.', duration: 3000, color: 'medium' });
        }
      },
      error: err => {
        console.error('Error al buscar recetas:', err);
        this.utilsSvc.presentToast({ message: 'Error al buscar recetas. Inténtalo de nuevo.', duration: 3000, color: 'danger' });
      }
    });
    this.ingredientToAdd = '';
  }

  getRecipeInfo(id: number) {
    this.recipesService.getRecipeInformation(id).subscribe({
      next: data => {
        this.selectedRecipe = data;
      },
      error: err => {
        console.error('Error al obtener información de la receta:', err);
        this.utilsSvc.presentToast({ message: 'Error al obtener detalles de la receta.', duration: 3000, color: 'danger' });
      }
    });
  }

  limpiarResultados() {
    this.recipes = [];
    this.selectedRecipe = null;
    this.ingredientToAdd = '';
    this.recetasAgrupadasPorPagina = [];
  }

  // ================== PAGINACIÓN =====================

  agruparRecetasPorPagina() {
    const pages = [];
    for (let i = 0; i < this.recipes.length; i += this.recetasPorPagina) {
      pages.push(this.recipes.slice(i, i + this.recetasPorPagina));
    }
    
    this.recetasAgrupadasPorPagina = pages;
  }

  // DESCOMENTAR SI SE QUIEREN ACTIVAR LOS BOTONES:

  get paginacionDeRecetas(): any[] {
    const start = (this.paginaActual - 1) * this.recetasPorPagina;
    const end = start + this.recetasPorPagina;
    return this.recipes.slice(start, end);
  }

  get paginasTotales(): number {
    return Math.ceil(this.recipes.length / this.recetasPorPagina);
  }

  paginaSiguiente() {
    if (this.paginaActual < this.paginasTotales) {
      this.paginaActual++;
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  // ====================================================

  async signOut() {
    try {
      await this.firebaseSvc.signOut();
      console.log('Sesión cerrada exitosamente desde HomePage.');
    } catch (error) {
      console.error("Error al cerrar sesión desde HomePage:", error);
      this.utilsSvc.presentToast({
        message: 'Error al cerrar sesión. Inténtalo de nuevo.',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }
  }

  toggleFavorito(selectedRecipe: any) {
    let favoritoExistente = null;
    for (const fav of this.favoritos) {
      if (fav.id === selectedRecipe.id) {
        favoritoExistente = fav;
        break;
      }
    }

    if (favoritoExistente) {
      this.favoritos.delete(favoritoExistente);
    } else {
      if (selectedRecipe && typeof selectedRecipe.id !== 'undefined' && typeof selectedRecipe.sourceUrl !== 'undefined') {
        this.favoritos.add({
          id: selectedRecipe.id,
          sourceUrl: selectedRecipe.sourceUrl,
          foto: selectedRecipe.image
        });
      } else {
        console.warn("No se pudo añadir a favoritos: datos de receta incompletos.", selectedRecipe);
        this.utilsSvc.presentToast({ message: 'No se pudo añadir a favoritos, datos incompletos.', duration: 2000, color: 'warning' });
        return;
      }
    }
    this.saveFavoritos();
  }

  isFavorito(recipe: { id: number; sourceUrl?: string }): boolean {
    if (typeof recipe.id === 'undefined') return false;
    return Array.from(this.favoritos).some(favorito => favorito.id === recipe.id);
  }

  saveFavoritos() {
    localStorage.setItem('favoritos', JSON.stringify(Array.from(this.favoritos)));
  }

  loadFavoritos() {
    const favoritosStorage = localStorage.getItem('favoritos');
    if (favoritosStorage) {
      try {
        const parsedFavoritos = JSON.parse(favoritosStorage);
        if (Array.isArray(parsedFavoritos)) {
          this.favoritos = new Set(parsedFavoritos.map(fav => ({
            id: fav.id,
            sourceUrl: fav.sourceUrl,
            foto: fav.foto
          })));
        } else {
          this.favoritos = new Set();
          console.warn("Favoritos en localStorage no era un array.");
        }
      } catch (e) {
        console.error("Error al parsear favoritos de localStorage:", e);
        this.favoritos = new Set();
      }
    }
  }

  verFavoritos() {
    this.router.navigate(['/favoritos']);
  }
  // Método para navegar a la página de edición de perfil
  onProfileClick() {
    console.log('Botón de perfil clickeado');
    console.log('Botón de perfil clickeado, navegando a /edit-profile');
    this.router.navigate(['/edit-profile']);
    this.utilsSvc.presentToast({ message: 'Perfil de usuario', duration: 2000, color: 'success' });
  }
}
