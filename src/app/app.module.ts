import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ForumComponent } from './components/forum/forum/forum.component';
import { ForumBackupComponent } from './components/forum/forum-backup/forum-backup.component';
import { ForumDetailComponent } from './components/forum/forum-detail/forum-detail.component';
import { ForumListComponent } from './components/forum/forum-list/forum-list.component';
import { LoginComponent } from './components/member/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    ForumComponent,
    ForumBackupComponent,
    ForumDetailComponent,
    ForumListComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    EditorModule,
    PaginatorModule,
    ButtonModule,
    TableModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
