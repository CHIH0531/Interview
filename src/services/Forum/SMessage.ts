import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IMessage } from '../../interfaces/Forum/IMessage';
import { DTMessageCreate } from '../../interfaces/Forum/IMessageCreate';
import { AuthGuardDemoService } from '../Workflow/auth-guard-demo/auth-guard-demo.service';

@Injectable({
  providedIn: 'root'
})
export class SMessage {
  private apiUrl = 'https://localhost:7201/api/TMessages';

  constructor(
    private http: HttpClient,
    private authGuardService: AuthGuardDemoService
  ) {}

  // 取得某文章的所有留言
  getMessagesByArticleId(articleId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?articleId=${articleId}`);
  }

  // 新增留言
  addMessage(newMessage: DTMessageCreate): Observable<IMessage> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('送出的資料:', JSON.stringify(newMessage));

    return this.http.post<IMessage>(this.apiUrl, newMessage, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // 根據 ID 取得單一留言
  getMessageById(messageId: number): Observable<IMessage> {
    return this.http.get<IMessage>(`${this.apiUrl}/${messageId}`);
  }

  // 更新留言
  updateMessage(messageId: number, updatedMessage: Partial<IMessage>): Observable<any> {
    const currentMemberId = this.authGuardService.getMemberId();
    if (!currentMemberId) {
      return throwError(() => new Error('未登入'));
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // 構建完整的更新資料
    const updateData = {
      fMessageId: messageId,
      fMessageContent: updatedMessage.fMessageContent,
      // 其他必要欄位...
    };

    return this.http.put<any>(
      `${this.apiUrl}/${messageId}?memberId=${currentMemberId}`,
      updateData,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // 刪除留言
  deleteMessage(messageId: number): Observable<any> {
    const currentMemberId = this.authGuardService.getMemberId();
    if (!currentMemberId) {
      return throwError(() => new Error('未登入'));
    }
    return this.http.delete(`${this.apiUrl}/${messageId}?memberId=${currentMemberId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // 統一的錯誤處理方法
  private handleError(error: HttpErrorResponse) {
    console.error('API 錯誤:', error);
    let errorMessage = '發生錯誤，請稍後再試';

    if (error.error && typeof error.error.message === 'string') {
      errorMessage = error.error.message;
    } else if (error.status === 403) {
      errorMessage = '您沒有權限執行此操作';
    } else if (error.status === 401) {
      errorMessage = '請先登入';
    }

    return throwError(() => new Error(errorMessage));
  }
}
