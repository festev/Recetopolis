export class Receta {
    id: number;
    title: string;
    image: string;
    extendedIngredients: { original: string }[];
    instructions: string;
    sourceUrl: string;

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.image = data.image;
        this.extendedIngredients = (data.extendedIngredients || []).map((ing: any) => ({original: ing.original}));
        this.instructions = data.instructions;
        this.sourceUrl = data.sourceUrl;
    }

    toJson(): object {
        return {
        id: this.id,
        title: this.title,
        image: this.image,
        extendedIngredients: this.extendedIngredients,
        instructions: this.instructions,
        sourceUrl: this.sourceUrl
        };
    }

}

export class RecetaLista {
  id: number;
  title: string;
  image: string;

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.image = data.image;
    }
}