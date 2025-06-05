import { GeoPoint } from "@angular/fire/firestore";
import { Receta } from "./receta.model";

export interface UserAuth {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserData {
  bio: string;
  location: GeoPoint | null;
  phoneNumber: string | null;
  favoritos: Receta[];
}