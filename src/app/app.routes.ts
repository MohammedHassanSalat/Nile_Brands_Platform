import { Routes } from '@angular/router';
import { SignupComponent } from './components/signup/signup.component';
import { HomeComponent } from './components/home/home.component';
import { ForgetPasseordComponent } from './components/forget-passeord/forget-passeord.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { LoginComponent } from './components/login/login.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { CartComponent } from './components/cart/cart.component';
import { VerifyemailComponent } from './components/verifyemail/verifyemail.component';
import { EditprofileComponent } from './components/editprofile/editprofile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: SignupComponent },
  { path: 'forgetpassword', component: ForgetPasseordComponent },
  { path: 'resetpassword', component: ResetPasswordComponent },
  { path: 'verifyemail', component: VerifyemailComponent },
  { path: 'signin', component: LoginComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'cart', component: CartComponent},
  { path: 'editprofile', component: EditprofileComponent},
];

