# Recetópolis

Proyecto educativo desarrollado para la materia **Desarrollo Mobile** del IFTS11.
Aplicación móvil hecha con **Ionic Angular** que permite buscar recetas por ingredientes, consultar detalles y guardar favoritas, consumiendo la API pública de **Spoonacular**.

## Estructura del Proyecto 📁

```
Recetopolis/
├── android/
├── src/                     # Código fuente de la app Ionic Angular
│   ├── app/                 # Módulos y páginas de la app
|   |   ├── directives
|   |   ├── explore-container
|   |   ├── guards           # Guards de rutas (Auth Guard, No Auth Guard) 
|   |   ├── models           # Interfaces y modelos de datos (receta y usuario)
|   |   ├── pages            # Páginas principales de la app
|   |   |   ├── auth         # Pantallas de autenticación (login, registro y recuperación)
|   |   |   ├── main         # Pantallas principales de la app (home, perfil, receta y favoritos)
|   |   ├── services         # Servicios para lógica de negocio
|   |   ├── shared           # Componentes reutilizables
│   ├── assets/              # Recursos estáticos (imágenes, iconos)
│   ├── environments/        # Variables de entorno para desarrollo y producción
│   ├── theme/
│   ├── index.html           # Entrada principal
│   ├── main.ts
│   └── ...                  # Otros archivos de configuración y código
├── ionic.config.json        # Configuración de Ionic
└── package.json             # Dependencias y scripts de npm
```

## Configuración Inicial 🔧

### 1. Clonar el proyecto

```bash
git clone https://github.com/festev/Recetopolis.git
```

### 2. Instalar dependencias

```bash
npm install
```

## Cómo levantar el proyecto ▶️

Para desarrollo local:

```bash
ionic serve
```

## Funcionalidades principales

- Búsqueda de recetas por ingredientes mediante la API de Spoonacular.
- Visualización detallada de cada receta, incluyendo ingredientes y pasos.
- Guardado y gestión de recetas favoritas.
- Creación y edición del perfil.
