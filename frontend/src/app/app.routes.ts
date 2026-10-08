import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { HubComponent } from './features/hub/hub.component';
import { ConfigureComponent } from './features/sessions/configure/configure.component';
import { SharedScreenSetupComponent } from './features/sessions/shared-screen-setup/shared-screen-setup.component';
import { JoinComponent } from './features/sessions/join/join.component';
import { LobbyComponent } from './features/sessions/lobby/lobby.component';
import { ActiveMatchComponent } from './features/sessions/active-match/active-match.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HubComponent },
      { path: 'configure/:slug', component: ConfigureComponent },
      { path: 'shared-screen-setup/:slug', component: SharedScreenSetupComponent },
      { path: 'join', component: JoinComponent },
      { path: 'lobby/:id', component: LobbyComponent },
      { path: 'active-match/:id', component: ActiveMatchComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
