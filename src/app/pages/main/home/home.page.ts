import { Component, ElementRef, ViewChild, OnInit, OnDestroy, inject } from '@angular/core';
import { DatePipe } from '@angular/common'; // Pipe para formatear fechas y horas.
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { RecipesService } from 'src/app/services/recipes.service';
import { Router } from '@angular/router'; // Servicio de Angular para manejar la navegación.
import { Receta, RecetaLista } from 'src/app/models/receta.model';  // Modelos para la estructura de las recetas.
import { UserAuth } from 'src/app/models/user.model';


// @Component: Define la clase HomePage como un componente de Angular.
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  providers: [DatePipe] // Provee DatePipe para ser usado específicamente en este componente.
})
export class HomePage implements OnInit, OnDestroy {

  @ViewChild('swiperRef', { read: ElementRef }) swiperRef!: ElementRef;

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  userAuth: UserAuth | null = null;

  ingredientToAdd: string = '';  // Almacena el ingrediente que el usuario ingresa para buscar recetas.
  recipes: RecetaLista[] = [];  // Array para almacenar los resultados de la búsqueda de recetas.

  currentTime: string | null = ''; // Almacena la hora actual formateada para mostrar en la UI.
  private timerInterval: any;   // Referencia al intervalo del temporizador para actualizar la hora

  //se siguen usando estos dos???
  items: string[];
  favoritos: Set<{ id: number, sourceUrl: string, foto?: string }> = new Set(); 

  //Variable de la paginación con los botones comentados
  paginaActual = 1;

  //Variables de la paginación con el Swiper (no borrar este)
  // Array de arrays, donde cada subarray es una página de recetas para el Swiper.
  recetasAgrupadasPorPagina: RecetaLista[][] = [];
  // Número de recetas a mostrar por cada slide/página del Swiper.
  recetasPorPagina = 7;

    /**
   * Constructor de la clase.
   * @param recipesService Servicio para obtener datos de recetas.
   * @param router Servicio de Angular para la navegación.
   * @param datePipe Pipe de Angular para formatear fechas/horas.
   */
  constructor(
    private recipesService: RecipesService,
    private router: Router,
    private datePipe: DatePipe // DatePipe se inyecta aquí porque está en `providers` del componente.
  ) {
    // para eliminar??
    this.items = ['Elemento 1', 'Elemento 2', 'Elemento 3', 'Elemento 4', 'Elemento 5'];
    }

      /**
   * @function ngOnInit
   * @description Inicializa el reloj en tiempo real al cargar la página.
   * @returns {void}
   */
  ngOnInit() {
    this.updateTime(); // Llama a updateTime inmediatamente para mostrar la hora al cargar.
    this.timerInterval = setInterval(() => { // Configura un intervalo para actualizar la hora cada segundo.
      this.updateTime();
    }, 1000);
  }

   /**
   * @function ionViewWillEnter
   * @description Recupera la información del usuario autenticado desde localStorage cuando se entra a la vista.
   * @returns {void}
   */
  ionViewWillEnter(){
    const raw = localStorage.getItem('userAuth');
    this.userAuth = raw ? JSON.parse(raw) as UserAuth : null;
  }

    /**
   * @function ngOnDestroy
   * @description Limpia el intervalo del reloj al destruir el componente.
   * @returns {void}
   */
  ngOnDestroy() {
    // Limpia el intervalo del temporizador si existe.
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  /**
   * @function updateTime
   * @description Actualiza la hora actual en formato HH:mm.
   * @returns {void}
   */
  updateTime() {
    const now = new Date();
    // Formato del reloj a HH:mm (ej: 21:40) usando DatePipe.
    this.currentTime = this.datePipe.transform(now, 'HH:mm');
  }

    /**
   * @function addIngredient
   * @description Agrega un ingrediente para buscar recetas y actualiza la paginación y el Swiper.
   * @returns {void}
   */
  addIngredient() {
    if (!this.ingredientToAdd.trim()) { // Valida que el campo de ingrediente no esté vacío.
      this.utilsSvc.presentToast({ message: 'Por favor, ingresa un ingrediente.', duration: 2000, color: 'warning' });
      return;
    }
    // Llama al servicio para obtener recetas basadas en el ingrediente. Se piden 28 recetas.
    this.recipesService.getRecipesByIngredients(this.ingredientToAdd, 28).subscribe({
      next: data => {
        this.recipes = data;

        setTimeout(() => { //reinicia el Swiper a la primera página  // setTimeout con 0ms asegura que esto ocurra después de que Angular procese los cambios.
          if (this.swiperRef?.nativeElement?.swiper) {
            this.swiperRef.nativeElement.swiper.slideTo(0);
          }
        }, 0);

        this.paginaActual = 1; //esto es para que los botones comentados empiecen en la primera página (se puede borrar)

        this.agruparRecetasPorPagina(); //esto es para la lógica de la paginación del Swiper (no borrar este)

        if (data.length === 0) { // Si no se encontraron recetas, muestra un mensaje al usuario.
          this.utilsSvc.presentToast({ message: 'No se encontraron recetas para los ingredientes proporcionados.', duration: 3000, color: 'medium' });
        }
      },
      error: err => {
        console.error('Error al buscar recetas:', err);
        this.utilsSvc.presentToast({ message: 'Error al buscar recetas. Inténtalo de nuevo.', duration: 3000, color: 'danger' });
      }
    });
    // Limpia el campo de entrada del ingrediente después de la búsqueda.
    this.ingredientToAdd = '';
  }

    /**
   * @function getRecipeInfo
   * @description Obtiene la información detallada de una receta y navega a la vista de receta.
   * @param {number} id - ID de la receta.
   * @returns {void}
   */
  getRecipeInfo(id: number) {
    this.recipesService.getRecipeInformation(id).subscribe({
      next: data => {
        // Guarda la información completa de la receta en el servicio para que la página de detalles la pueda usar.
        this.recipesService.setRecetaSeleccionada(data);
        // Navega a la página de detalles de la receta, pasando el ID como parámetro de ruta.
        this.router.navigate(['/main/receta', id]);       
      },
      error: err => {
        console.error('Error al obtener información de la receta:', err);
        this.utilsSvc.presentToast({ message: 'Error al obtener detalles de la receta.', duration: 3000, color: 'danger' });
      }
    });
  }

    /**
   * @function limpiarResultados
   * @description Limpia los resultados actuales de recetas y el input de ingrediente.
   * @returns {void}
   */
  limpiarResultados() {
    this.recipes = [];
    this.ingredientToAdd = '';
    this.recetasAgrupadasPorPagina = []; // Importante para resetear el Swiper visualmente.
  }

  // ================== PAGINACIÓN =====================

    /**
   * @function agruparRecetasPorPagina
   * @description Agrupa las recetas en bloques de recetasPorPagina para la paginación con Swiper.
   * @returns {void}
   */
  agruparRecetasPorPagina() {
    //Agrupa las recetas en páginas (creo recordar que eran Arrays) para luego mostrar en el swiper
    const pages = [];
    for (let i = 0; i < this.recipes.length; i += this.recetasPorPagina) {
      pages.push(this.recipes.slice(i, i + this.recetasPorPagina));
    }
    
    this.recetasAgrupadasPorPagina = pages;
  }

  // DESCOMENTAR SI SE QUIEREN ACTIVAR LOS BOTONES:

  /*get paginacionDeRecetas(): any[] {
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
  }*/

  // ====================================================

  /**
   * @function signOut
   * @description Cierra la sesión del usuario actual usando Firebase.
   * @returns {Promise<void>}
   */
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

  /**
   * @function verFavoritos
   * @description Navega a la página de favoritos.
   * @returns {void}
   */
  verFavoritos() {
    this.router.navigate(['/main/favoritos']);
  }

    /**
   * @function onProfileClick
   * @description Navega a la página de edición de perfil y muestra un toast.
   * @returns {void}
   */
  onProfileClick() {
    console.log('Botón de perfil clickeado');
    console.log('Botón de perfil clickeado, navegando a /edit-profile');
    this.router.navigate(['/main/edit-profile']);
    this.utilsSvc.presentToast({ message: 'Perfil de usuario', duration: 2000, color: 'success' });
  }
}
