import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouteReuseStrategy, RouterModule } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule  } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
//========= Firebase =========
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment.prod';
import { FavoritosPage } from './pages/main/favoritos/favoritos.page';
import { MainPage } from './pages/main/main.page';

const routes: Routes = [  
  { path: '', component: MainPage }, // Cambia esto según tu estructura  
  { path: 'favoritos', component: FavoritosPage },  
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ mode: 'md' }),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), HttpClientModule, FormsModule, RouterModule.forChild(routes)
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  exports: [RouterModule],
})
export class AppModule { }
