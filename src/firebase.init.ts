import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { environment } from './environments/environment';

const firebaseApp = initializeApp(environment.firebaseConfig);

getAnalytics(firebaseApp);

export { firebaseApp };
