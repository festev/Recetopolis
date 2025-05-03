import { Component, OnInit, inject} from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { RecipesService } from 'src/app/recipes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  ingredientToAdd: string = '';  
  recipes: any[] = [];  
  selectedRecipe: any = null;  
  currentTime: string;
  items: string[];
  favoritos: Set<{ id: number, sourceUrl: string }> = new Set();

  constructor(private recipesService: RecipesService, private router: Router) {this.items = ['Elemento 1', 'Elemento 2', 'Elemento 3', 'Elemento 4', 'Elemento 5'];}  
  
  updateTime() {  
    const now = new Date();  
    this.currentTime = now.toLocaleTimeString(); // aca obtenemos la hora
  }

  addIngredient() {  
    if (!this.ingredientToAdd) {  
      return;  
    }  
    this.recipesService.getRecipesByIngredients(this.ingredientToAdd, 5).subscribe(data => {  
      this.recipes = data;  
      this.selectedRecipe = null; // Reinicializa la receta seleccionada  
    });  
    this.ingredientToAdd = ''; // Limpiar el campo de entrada  
  }  

  getRecipeInfo(id: number) {  
    this.recipesService.getRecipeInformation(id).subscribe(data => {  
      this.selectedRecipe = data;  
      //console.log(this.selectedRecipe);
    });  
  }  
  
  // =========== Limpia los resultados para realizar otra busqueda =======

  limpiarResultados() {  
    this.recipes = []; // Limpia la lista de recetas  
    this.selectedRecipe = null; // Limpia la receta seleccionada  
    this.ingredientToAdd = ''; // Limpia el campo de entrada  
  }  

  // =============== Hora del Sistema ============

  ngOnInit() {
    this.updateTime();  
    setInterval(() => {  
      this.updateTime();  
    }, 1000); 
    this.loadFavoritos(); //Cargar los favoritos desde localStorage al iniciar
  }

  //============ Cerrar Sesión =============

  signOut(){
    this.firebaseSvc.signOut();
  }

  // ============= Funciones de Favoritos =============  
  
  toggleFavorito(selectedRecipe: any) {  
    const favorito = { id: selectedRecipe.id, sourceUrl: selectedRecipe.sourceUrl, foto: selectedRecipe.image }; // Crear objeto para favoritos  
  
    if (this.isFavorito(favorito)) {  
        this.favoritos.delete(favorito); // Eliminar si ya es favorito  
    } else {  
        this.favoritos.add(favorito); // Añadir si no es favorito  
    }  
  
    this.saveFavoritos();  
}
  // ============ Me permite seleccionar y borrar el favorito =================
  isFavorito(recipe: { id: number; sourceUrl: string }): boolean {  
    return Array.from(this.favoritos).some(favorito => favorito.id === recipe.id && favorito.sourceUrl === recipe.sourceUrl);  
  }  

  saveFavoritos() {  
    //const favoritosArray = Array.from(this.favoritos);  
    //localStorage.setItem('favoritos', JSON.stringify(favoritosArray));  
    localStorage.setItem('favoritos', JSON.stringify(Array.from(this.favoritos)));
  }  
  
  loadFavoritos() {  
    const favoritosStorage = localStorage.getItem('favoritos');  
    if (favoritosStorage) {  
      this.favoritos = new Set(JSON.parse(favoritosStorage));  
    }  
  }  

  verFavoritos() {  
    this.router.navigate(['/favoritos']); // Navega a la página de favoritos  
  } 
}
