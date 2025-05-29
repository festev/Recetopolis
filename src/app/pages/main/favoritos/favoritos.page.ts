import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
})

export class FavoritosPage {
  favoritos: any[] = [];
  selectedRecipe: any[] = [];

  constructor(private router: Router) {
    this.cargarFavoritos();
  }
  irAHome() {
    this.router.navigate(['/main/home']); // Navega a la ruta de tu página principal
  }
  cargarFavoritos() {

    const favoritosGuardados = localStorage.getItem('favoritos');
    this.favoritos = favoritosGuardados ? JSON.parse(favoritosGuardados) : [];

    //console.log(this.favoritos);  
  }

  toggleFavorito(selectedRecipe: any) {
    const index = this.favoritos.findIndex(r => r.id === selectedRecipe.id); // Asumiendo que cada receta tiene un ID único  

    if (index > -1) {
      // Si está en la lista, quitarlo  
      this.favoritos.splice(index, 1);
    } else {
      // Si no está, agregarlo  
      //console.log('Agregando favorito:', selectedRecipe.sourceUrl); // Verifico que se grabe la url maldita receta
      this.favoritos.push({
        id: selectedRecipe.id,
        //title: selectedRecipe.title, // Asegúrate de que estas propiedades existan  
        foto: selectedRecipe.image, // Cambiado de 'image' a 'imageUrl'  
        sourceUrl: selectedRecipe.sourceUrl // Asegúrate de que este campo existe en 'recipe'  
      });
    }

    // Guardar la lista actualizada en localStorage  
    localStorage.setItem('favoritos', JSON.stringify(this.favoritos));
  }

  // Nuevo método para manejar el clic en el enlace  
  verReceta(sourceUrl: string) {
    console.log(sourceUrl); // Aquí se imprime el enlace en la consola  
    window.open(sourceUrl, "_blank"); // Abrir la receta en una nueva pestaña  
  }

  agregarASeleccionados(selectedRecipe: any) {
    this.toggleFavorito(selectedRecipe);
  }

}
