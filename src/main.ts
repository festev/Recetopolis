import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import './firebase.init';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
