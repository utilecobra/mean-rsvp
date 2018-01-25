import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { CallbackComponent } from './pages/callback/callback.component';

import { AuthService } from './auth/auth.service';
import { ApiService } from './core/api.service';
import { UtilsService } from './core/utils.service';
import { FilterSortService } from './core/filter-sort.service';
import { MyRsvpsComponent } from './pages/my-rsvps/my-rsvps.component';
import { EventModel } from './core/models/event.model';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CallbackComponent,
    MyRsvpsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AuthModule.forRoot(),
    CoreModule.forRoot(),
  ],
  providers: [
    Title,
    AuthService,
    ApiService,
    DatePipe,
    UtilsService,
    FilterSortService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
