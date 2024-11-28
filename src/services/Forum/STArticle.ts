import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ITArticle } from '../../interfaces/Forum/ITArticle';

@Injectable({
  providedIn: 'root'
})
export class STArticleService {
  private apiUrl = 'https://localhost:7201/api/TArticles';

  constructor(private http: HttpClient) { }

  getArticlesByCategory(categoryNumber: number): Observable<ITArticle[]> {
    return this.http.get<ITArticle[]>(`${this.apiUrl}/category/${categoryNumber}`);
  }

  getArticleById(articleId: number): Observable<ITArticle> {
    return this.http.get<ITArticle>(`${this.apiUrl}/${articleId}`);
  }

  createArticle(article: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const formattedArticle = {
      FArticleName: article.FArticleName,
      FArticleContent: article.FArticleContent,
      FCategoryNumber: article.FCategoryNumber,
      FMemberID: article.FMemberID
    };

    console.log('發送到後端的資料：', formattedArticle);

    return this.http.post<any>(this.apiUrl, formattedArticle, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('API 錯誤：', error);
          if (error.error instanceof ErrorEvent) {
            console.error('客戶端錯誤：', error.error.message);
          } else {
            console.error(
              `後端回傳錯誤碼 ${error.status}, ` +
              `錯誤訊息: ${error.error?.message || error.statusText}`
            );
          }
          return throwError(() => error);
        })
      );
  }

  updateArticle(article: ITArticle): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${article.fArticleID}`, article);
  }

  deleteArticle(articleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${articleId}`);
  }
}
