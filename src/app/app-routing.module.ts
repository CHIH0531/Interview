import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/member/login/login.component';
import { AuthGuard } from './auth/auth.guard'; // 路由守衛
import { ForumComponent } from './components/forum/forum/forum.component';
import { ForumBackupComponent } from './components/forum/forum-backup/forum-backup.component';
import { ForumDetailComponent } from './components/forum/forum-detail/forum-detail.component';
import { ForumListComponent } from './components/forum/forum-list/forum-list.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forum',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ForumComponent
      },
      {
        path: 'backup/:fCategoryNumber',
        component: ForumBackupComponent
      },
      {
        path: 'backup/:fCategoryNumber/:fArticleID',
        component: ForumBackupComponent
      },
      {
        path: 'detail/:fArticleID',
        component: ForumDetailComponent
      },
      {
        path: 'list/:fCategoryNumber',
        component: ForumListComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
