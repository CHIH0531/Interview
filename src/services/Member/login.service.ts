import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { IMember } from '../../interfaces/Member/IMember';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  private apiUrl = 'https://localhost:7201/api/Auth';

  saveMemberId(memberId: string) {
    localStorage.setItem("MemberId", memberId);
  }

  // 從 localStorage 取得 memberId，若無則自動跳轉至登入頁面
  getMemberId(): number | null {
    const memberIdStr = localStorage.getItem('MemberId');
    const memberId = memberIdStr ? parseInt(memberIdStr, 10) : null; // 將 memberId 字串轉為數字

    if (!memberId) {
      this.redirectToLogin(); // 若無 memberId，自動跳轉到登入頁面
    }

    return memberId;
  }

  // 確認是否已登入
  isLoggedIn(): boolean {
    return !!localStorage.getItem('MemberId'); // 檢查是否有 memberId
  }

  login(memberLogin: IMember): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/login`, memberLogin)
      .pipe(
        tap(response => {
          if (response.success) {
            this.saveMemberId(response.memberId.toString());
            this.router.navigate(['/forum']).then(
              () => console.log('導航成功'),
              err => console.error('導航錯誤：', err)
            );
          }
        }),
        catchError(error => {
          console.error('登入錯誤：', error);
          return throwError(() => new Error(error.error?.message || '登入失敗，請稍後再試'));
        })
      );
  }

  savePubId(PubId: string) {
    localStorage.setItem("PublisherId", PubId);
  }
  // 請取用
  getPubId(): string | null {
    return localStorage.getItem("PublisherId");
  }

  // 導向登入頁面
  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }


  // 清除 memberId，登出時可使用
  clearMemberId(): void {
    localStorage.removeItem('MemberId');
  }

}
