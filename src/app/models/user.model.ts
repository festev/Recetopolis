import { Receta } from "./receta.model";

export interface UserAuth {
  uid: string;
  email: string;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
}

export interface UserData {
  bio: string;
  location: string;
  favoritos: Receta[];
}