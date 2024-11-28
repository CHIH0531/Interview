import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { STArticleService } from '../../../../services/Forum/STArticle';
import { ITArticle } from '../../../../interfaces/Forum/ITArticle';
import { AuthGuardDemoService } from '../../../../services/Workflow/auth-guard-demo/auth-guard-demo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forum-backup',
  templateUrl: './forum-backup.component.html',
  styleUrls: ['./forum-backup.component.css']
})
export class ForumBackupComponent implements OnInit {
  newArticle: ITArticle = {
    fArticleID: 0,
    fArticleName: '',
    fArticleContent: '',
    fCategoryNumber: 1,
    fMemberID: 1,
    fCreatedAt: undefined,
    fUpdatedAt: undefined
  };
  fCategoryNumber!: number;
  isEditMode: boolean = false;
  currentMemberId: number | null = null;

  constructor(
    private articleService: STArticleService,
    private router: Router,
    private route: ActivatedRoute,
    private authGuardService: AuthGuardDemoService
  ) {}

  ngOnInit(): void {
    this.currentMemberId = this.authGuardService.getMemberId();

    if (this.currentMemberId === null) {
      Swal.fire({
        title: '請先登入',
        text: '請先登入後再發表文章！',
        icon: 'warning',
        confirmButtonColor: '#6495ed'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    this.route.paramMap.subscribe(params => {
      this.fCategoryNumber = +params.get('fCategoryNumber')!;
      const articleId = params.get('fArticleID');

      if (articleId) {
        this.isEditMode = true;
        this.loadArticle(+articleId);
      } else {
        this.isEditMode = false;
        this.newArticle.fCategoryNumber = this.fCategoryNumber;
      }
    });
  }

  loadArticle(articleId: number): void {
    this.articleService.getArticleById(articleId).subscribe({
      next: (article) => {
        this.newArticle = article;
      },
      error: (error) => {
        console.error('載入文章失敗', error);
        Swal.fire({
          title: '載入失敗',
          text: '無法載入文章資料，請稍後再試。',
          icon: 'error',
          confirmButtonColor: '#6495ed'
        });
      }
    });
  }

  createArticle(): void {
    if (!this.currentMemberId) {
      Swal.fire({
        title: '請先登入',
        text: '請先登入後再發表文章！',
        icon: 'warning',
        confirmButtonColor: '#6495ed'
      });
      return;
    }

    if (!this.newArticle.fArticleName?.trim()) {
      Swal.fire({
        title: '標題不能為空',
        text: '請填寫文章標題',
        icon: 'warning',
        confirmButtonColor: '#6495ed'
      });
      return;
    }

    if (!this.newArticle.fArticleContent || this.newArticle.fArticleContent.trim() === '') {
      Swal.fire({
        title: '內容不能為空',
        text: '請填寫文章內容',
        icon: 'warning',
        confirmButtonColor: '#6495ed'
      });
      return;
    }

    const articleData = {
      FArticleName: this.newArticle.fArticleName?.trim(),
      FArticleContent: this.newArticle.fArticleContent?.trim(),
      FCategoryNumber: this.fCategoryNumber,
      FMemberID: this.currentMemberId
    };

    console.log('發送的資料：', articleData);

    this.articleService.createArticle(articleData).subscribe({
      next: (response) => {
        console.log('成功回應：', response);
        Swal.fire({
          title: '成功',
          text: '文章新增成功！',
          icon: 'success',
          timer: 2000,
          confirmButtonColor: '#6495ed'
        }).then(() => {
          this.router.navigate(['/forum/list', this.fCategoryNumber], {
            queryParams: {
              newArticleId: response.fArticleID,
              action: 'new'
            }
          });
        });
      },
      error: (error) => {
        console.error('錯誤詳情：', error);
        let errorMessage = '新增文章失敗';
        if (error.error?.message) {
          errorMessage += `: ${error.error.message}`;
        }
        Swal.fire({
          title: '錯誤',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#6495ed'
        });
      }
    });
  }

  updateArticle(): void {
    if (!this.newArticle.fArticleName?.trim()) {
      Swal.fire({
        title: '標題不能為空',
        text: '請填寫文章標題',
        icon: 'warning',
        confirmButtonColor: '#6495ed'
      });
      return;
    }

    if (!this.newArticle.fArticleContent || this.newArticle.fArticleContent.trim() === '') {
      Swal.fire({
        title: '內容不能為空',
        text: '請填寫文章內容',
        icon: 'warning',
        confirmButtonColor: '#6495ed'
      });
      return;
    }

    const articleToUpdate: ITArticle = {
      ...this.newArticle,
      fUpdatedAt: new Date()
    };

    this.articleService.updateArticle(articleToUpdate).subscribe({
      next: (response) => {
        Swal.fire({
          title: '成功',
          text: '文章更新成功！',
          icon: 'success',
          timer: 2000,
          confirmButtonColor: '#6495ed'
        }).then(() => {
          this.router.navigate(['/forum/list', this.fCategoryNumber], {
            queryParams: {
              newArticleId: this.newArticle.fArticleID,
              action: 'edit'
            }
          });
        });
      },
      error: (error) => {
        console.error('更新文章失敗', error);
        Swal.fire({
          title: '錯誤',
          text: '無法更新文章，請稍後再試。',
          icon: 'error',
          confirmButtonColor: '#6495ed'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/forum/list', this.fCategoryNumber]);
  }

  createDemoArticle(): void {
    if (!this.currentMemberId) {
      Swal.fire({
        title: '請先登入',
        text: '請先登入後再發表文章！',
        icon: 'warning',
        confirmButtonColor: '#6495ed'
      });
      return;
    }

    this.newArticle = {
      ...this.newArticle,
      fArticleName: '小公司當人資真的不好嗎？',
      fArticleContent: '最近我應徵到一份小公司的人資 工作內容包括招募、薪酬、訓練、績效等等全部都要做，今天我上完課之後，跟我的同學分享這件事情，看完工作內容後他跟我說 工作內容這麼多這個沒有10萬他不做，還跟我說你要去就要去大公司，大公司的體系完整學得到東西而且很專精，可是感覺這個就是打雜的，他的口中讓我覺得他好像很看不起這些工作內容跟這家公司，笑著說這根本不是人資這是老闆特助，這位同學是一個知名百大公司的工程師，跟我說叫我要去大公司，來這種小公司沒什麼用而且也學不到東西....... 原本我對這個工作保持著很開心的心情，因為終於有機會可以進到人資的工作圈，可是聽他這樣講，我的心情簡直是跌落谷底，小公司的人資真的像他所說的這麼沒用嗎？\n\n有沒有做人資的前輩可以幫我解答呢'
    };
  }
}
