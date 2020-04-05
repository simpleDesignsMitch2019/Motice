import 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/functions';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { DynamicDialogModule, DialogService } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { InputMaskModule } from 'primeng/inputmask';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { NgxUiLoaderModule, NgxUiLoaderConfig, SPINNER, POSITION, PB_DIRECTION } from 'ngx-ui-loader';

import { NgxStripeModule } from 'ngx-stripe';

import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { environment } from '../environments/environment';
import { AuthComponent } from './components/auth/auth.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ForgotComponent } from './components/auth/forgot/forgot.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { VerifyComponent } from './components/auth/verify/verify.component';
import { ProfileComponent } from './components/profile/profile.component';
import { GeneralComponent } from './components/profile/general/general.component';
import { CredentialsComponent } from './components/profile/credentials/credentials.component';
import { SubscriptionComponent } from './components/profile/subscription/subscription.component';
import { ClientsComponent } from './components/clients/clients.component';
import { CreateClientComponent } from './components/clients/create-client/create-client.component';
import { PhonePipe } from './shared/pipes/phone.pipe';
import { EditClientComponent } from './components/clients/edit-client/edit-client.component';
import { CompaniesComponent } from './components/profile/companies/companies.component';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
    "bgsColor": "#007bff",
    "bgsOpacity": 0.5,
    "bgsPosition": "bottom-right",
    "bgsSize": 60,
    "bgsType": "fading-circle",
    "blur": 12,
    "delay": 0,
    "fastFadeOut": true,
    "fgsColor": "#007bff",
    "fgsPosition": "top-right",
    "fgsSize": 30,
    "fgsType": "pulse",
    "gap": 10,
    "logoPosition": "top-left",
    "logoSize": 0,
    "logoUrl": "assets/logo.png",
    "masterLoaderId": "master",
    "overlayBorderRadius": "0",
    "overlayColor": "rgba(40, 40, 40, 0.8)",
    "pbColor": "#007bff",
    "pbDirection": "ltr",
    "pbThickness": 2,
    "hasProgressBar": true,
    "text": "",
    "textColor": "#FFFFFF",
    "textPosition": "top-left",
    "maxTime": -1,
    "minTime": 300
}

@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        LoginComponent,
        RegisterComponent,
        ForgotComponent,
        DashboardComponent,
        VerifyComponent,
        ProfileComponent,
        GeneralComponent,
        CredentialsComponent,
        SubscriptionComponent,
        ClientsComponent,
        CreateClientComponent,
        PhonePipe,
        EditClientComponent,
        CompaniesComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        AngularFirestoreModule,
        AngularFireStorageModule,
        NgxStripeModule.forRoot(environment.stripePKey),
        SidebarModule,
        ToastModule,
        TooltipModule,
        NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
        PanelModule,
        DynamicDialogModule,
        MenuModule,
        SweetAlert2Module.forRoot(),
        Ng2SearchPipeModule,
        InputMaskModule
    ],
    providers: [MessageService, DialogService, ClientsComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }
