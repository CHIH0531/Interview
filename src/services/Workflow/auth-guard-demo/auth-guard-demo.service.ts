import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardDemoService {

  constructor(private http: HttpClient,
              private router: Router
  ) {}

  // 確認是否已登入
  isLoggedIn(): boolean {
    return !!localStorage.getItem('MemberId'); // 檢查是否有 memberId
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

  // 導向登入頁面
  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }


  // 清除 memberId，登出時可使用
  clearMemberId(): void {
    localStorage.removeItem('MemberId');
  }

  // // 儲存 memberId 到 localStorage
  // setMemberId(memberId: string): void {
  //   localStorage.setItem('MemberId', memberId);
  // }

}
