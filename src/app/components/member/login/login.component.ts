import { Component, OnInit } from '@angular/core';
import { IMember } from '../../../../interfaces/Member/IMember';
import { Router } from '@angular/router'; // 用於登入後導向其他頁面
import { LoginService } from '../../../../services/Member/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  userId: number = 2;
  userName: string = 'Selina';
  email: string = 'Selina@yahoo.com'; // 綁定電子郵件輸入
  password: string = '2244'; // 綁定密碼輸入
  emailError: string = ""; // 儲存電子郵件錯誤訊息
  passwordError: string = ""; // 儲存密碼錯誤訊息
  showPassword: boolean = false;

  // 將輸入的 email 和 password 封裝成一個符合 ILoginMember 介面的物件
  memberLogin: IMember = {
    fMemberId: 0,
    fName: '',
    fEmail: '',
    fPassword: '',
    fPhone: '',
    fAddress: ''
  };

  // 使用建構函式進行依賴注入
  constructor(private loginService: LoginService, private router: Router) { }

  // 當使用者點擊登入按鈕時，觸發 onLogin 方法
  onLogin() {
    // 清空之前的錯誤訊息
    this.emailError = '';
    this.passwordError = '';

    // 呼叫 UserService 的 login 方法，將登入資料發送到後端 API
    this.loginService.login(this.memberLogin).subscribe({
      next: (response) => {
        console.log('登入成功!!!!', response); // 在控制台顯示成功訊息

        // 將會員 ID 儲存到 localStorage
        this.loginService.saveMemberId(response.memberId);

        // 從 localStorage 中取得儲存的會員 ID 並顯示
        const memberid = this.loginService.getMemberId();
        console.log('會員ID:' + memberid);

        // 登入成功後導向到主頁
        this.router.navigate(['/forum']);
      },
      error: (error) => {
        console.error('登入失敗', error); // 在控制台顯示錯誤訊息

        // 根據錯誤的狀態碼判斷錯誤類型，並設定相應的錯誤訊息
        if (error.status === 404) {
          this.emailError = '無此電子郵件帳號，請先註冊';
        } else if (error.status === 401) {
          this.passwordError = '您輸入的密碼不正確';
        } else {
          alert('發生錯誤，請稍後再試');
        }
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // 添加 Demo Selina 帳號
  fillDemoAccount3() {
    this.memberLogin.fEmail = 'Selina@yahoo.com';
    this.memberLogin.fPassword = '2244';
  }

  // 阿智偷偷寫的方法--demo使用
fillDemoAccount() {
  this.memberLogin.fEmail = 'marco@gmail.com';
  this.memberLogin.fPassword = '12340';
}
fillDemoAccount2() {
  this.memberLogin.fEmail = 'Jesse@yahoo.com';
  this.memberLogin.fPassword = '000';
}

}
