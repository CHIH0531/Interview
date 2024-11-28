import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
//import { AuthGuardDemoService } from '../services/Workflow/auth-guard-demo/auth-guard-demo.service';
import { LoginService } from '../../services/Member/login.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authguarddemo = inject(LoginService); // 使用 inject() 取得服務
  const router = inject(Router);

  // 檢查使用者是否已登入
  if (authguarddemo.isLoggedIn()) {
    return true; // 若已登入，允許進入
  } else {
    // 若未登入，重定向至登入頁面
    router.navigate(['/login']);
    return false; // 禁止進入
  }
};
