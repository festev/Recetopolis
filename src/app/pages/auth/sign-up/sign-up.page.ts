import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserAuth, UserData } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)])
  })

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService)

  ngOnInit() {
  }

  async submit() {
    if (this.form.valid) {

      const loading = await this.utilsSvc.loading()
      await loading.present();

      try {

        const res = await this.firebaseSvc.signUp(this.form.value.email!, this.form.value.password!);

        const userAuth: UserAuth = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: this.form.value.name,
          photoURL: "",
        };

        const userData: UserData = {
          bio: "",
          location: null,
          phoneNumber: "",
          favoritos: []
        };

        await this.firebaseSvc.updateUser(userAuth.displayName);
        await this.firebaseSvc.setDocument(`users/${res.user.uid}`, userData, true)

        this.utilsSvc.saveInLocalStorage('userAuth', userAuth);
        this.utilsSvc.saveInLocalStorage('userData', userData);
        this.utilsSvc.routerLink('/main/home');
        this.form.reset();

        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida, ${userAuth.displayName}`,
          duration: 1500,
          color: 'primary',
          position:'middle',
          icon: 'person-circle-outline'
        })


      } catch(error: any) {
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })


      } finally {
        loading.dismiss();
      }
    }
  }

/*
  async setUserInfo(uid: string) {
    if (this.form.valid) {

      const loading = await this.utilsSvc.loading()
      await loading.present();

      let path =  `users/${uid}`
      delete this.form.value.password;

      this.firebaseSvc.setDocument(path, this.form.value).then(async res => {

        this.utilsSvc.saveInLocalStorage('user',this.form.value);
        this.utilsSvc.routerLink('/main/home');
        this.form.reset();


      }).catch(error =>{
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message,
          duration:2500,
          color: 'primary',
          position:'middle',
          icon: 'alert-circle-outline'
        })


      }).finally(() =>{
        loading.dismiss();
      })
    }
  }
*/

}
