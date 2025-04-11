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
import { FeedbackComponent } from './components/feedback/feedback.component';
import { TrackorderComponent } from './components/trackorder/trackorder.component';
import { ProductdetailsComponent } from './components/productdetails/productdetails.component';
import { CreatebrandComponent } from './components/brandDashboard/createbrand/createbrand.component';
import { OwnerDashboardComponent } from './components/brandDashboard/owner-dashboard/owner-dashboard.component';
import { HeroComponent } from './components/brandDashboard/hero/hero.component';
import { AddproductComponent } from './components/brandDashboard/addproduct/addproduct.component';
import { ProfileComponent } from './components/brandDashboard/profile/profile.component';
import { UpdatebrandComponent } from './components/brandDashboard/updatebrand/updatebrand.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },

  { path: 'register', component: SignupComponent },
  { path: 'forgetpassword', component: ForgetPasseordComponent },
  { path: 'resetpassword', component: ResetPasswordComponent },
  { path: 'verifyemail', component: VerifyemailComponent },
  { path: 'signin', component: LoginComponent },
  

  {
    path: 'wishlist',
    component: WishlistComponent,
    canActivate: [authGuard],
    data: { roles: ['user'] },
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [authGuard],
    data: { roles: ['user'] },
  },
  {
    path: 'editprofile',
    component: EditprofileComponent,
    canActivate: [authGuard],
    data: { roles: ['user'] },
  },
  {
    path: 'feedback',
    component: FeedbackComponent,
    canActivate: [authGuard],
    data: { roles: ['user'] },
  },
  {
    path: 'trackorder',
    component: TrackorderComponent,
    canActivate: [authGuard],
    data: { roles: ['user'] },
  },


  {
    path: 'products/:id',
    component: ProductdetailsComponent,
  },

  {
    path: 'createbrand',
    component: CreatebrandComponent,
    canActivate: [authGuard],
    data: { roles: ['owner'] },
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    data: { roles: ['owner'] },
    component: OwnerDashboardComponent,
    children: [
      { path: 'hero', component: HeroComponent },
      { path: 'addproduct', component: AddproductComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'updatebrand', component: UpdatebrandComponent },
    ],
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
