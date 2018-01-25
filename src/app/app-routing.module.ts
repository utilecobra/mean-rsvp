import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';

// Components
import { HomeComponent } from './pages/home/home.component';
import { CallbackComponent } from './pages/callback/callback.component';
import { AdminComponent } from './pages/admin/admin.component';
import { EventComponent } from './pages/event/event.component';
import { CreateEventComponent } from './pages/admin/create-event/create-event.component';
import { UpdateEventComponent } from './pages/admin/update-event/update-event.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: 'admin',
    canActivate: [
      AuthGuard,
      AdminGuard
    ],
    children: [
      {
        path: '',
        component: AdminComponent
      },
      {
        path: 'event/new',
        component: CreateEventComponent
      },
      {
        path: 'event/update/:id',
        component: UpdateEventComponent
      },
    ]
  },
  {
    path: 'event/:id',
    component: EventComponent,
    canActivate: [
      AuthGuard
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    AuthGuard,
    AdminGuard,
  ]
})
export class AppRoutingModule { }
