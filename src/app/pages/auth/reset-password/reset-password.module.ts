// src/app/pages/reset-password/reset-password.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Asegúrate que FormsModule esté importado
import { IonicModule } from '@ionic/angular';
import { ResetPasswordPageRoutingModule } from './reset-password-routing.module';
import { ResetPasswordPage } from './reset-password.page';
import { MatchPasswordDirective } from 'src/app/directives/match-password.directive'; // Importa la directiva

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // Necesario para ngModel y validación de formularios
    IonicModule,
    ResetPasswordPageRoutingModule
  ],
  declarations: [
    ResetPasswordPage,
    MatchPasswordDirective // Declara la directiva aquí
  ]
})
export class ResetPasswordPageModule { }
