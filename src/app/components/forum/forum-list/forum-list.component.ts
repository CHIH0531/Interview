import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { STArticleService } from '../../../../services/Forum/STArticle';
import { STCategoryService } from '../../../../services/Forum/STCategory';
import { ITArticle } from '../../../../interfaces/Forum/ITArticle';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthGuardDemoService } from '../../../../services/Workflow/auth-guard-demo/auth-guard-demo.service';
import { FTMemberService } from '../../../../services/Forum/SFTMember';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forum-list',
  templateUrl: './forum-list.component.html',
  styleUrls: ['./forum-list.component.css']
})
export class ForumListComponent implements OnInit {
  fCategoryNumber!: number; // 類別編號
  articles: ITArticle[] = []; // 文章列表
  filteredArticles: ITArticle[] = []; // 過濾後的文章列表
  categoryName: string = ''; // 類別名稱
  errorMessage: string | null = null; // 錯誤訊息
  searchTerm: string = ''; // 搜尋關鍵字
  pageSize: number = 8; // 每頁顯示的文章數量
  pagedArticles: any[] = []; // 分頁後的文章
  currentMemberId: number | null = null; // 當前會員 ID
  memberNames: { [key: number]: string } = {}; // 會員名稱對應表
  memberLoading: boolean = false; // 會員資料加載狀態
  currentPage: number = 1; // 當前頁碼

  constructor(
    private route: ActivatedRoute,
    private articleService: STArticleService,
    private categoryService: STCategoryService,
    private sanitizer: DomSanitizer,
    private authGuardService: AuthGuardDemoService,
    private memberService: FTMemberService
  ) { }

  ngOnInit(): void {
    this.currentMemberId = this.authGuardService.getMemberId(); // 獲取當前會員 ID

    // 訂閱路由參數變化
    this.route.paramMap.subscribe(params => {
      this.fCategoryNumber = +params.get('fCategoryNumber')!;
      this.loadArticles(this.fCategoryNumber); // 加載文章
      this.loadCategoryName(this.fCategoryNumber); // 加載類別名稱
    });

    // 訂閱查詢參數變化
    this.route.queryParams.subscribe(queryParams => {
      const newArticleId = queryParams['newArticleId'];
      const action = queryParams['action'];

      if (newArticleId) {
        setTimeout(() => {
          this.scrollToNewArticle(+newArticleId); // 滾動到新文章
          const articleElement = document.querySelector(`[data-article-id="${newArticleId}"]`);
          if (articleElement) {
            if (action === 'edit') {
              articleElement.classList.add('highlight-edited-article'); // 高亮編輯的文章
              setTimeout(() => {
                articleElement.classList.remove('highlight-edited-article');
              }, 3000);
            } else {
              articleElement.classList.add('highlight-new-article'); // 高亮新文章
              setTimeout(() => {
                articleElement.classList.remove('highlight-new-article');
              }, 3000);
            }
          }
        }, 500);
      }
    });
  }

  // 加載指定類別的文章
  loadArticles(fCategoryNumber: number): void {
    this.articleService.getArticlesByCategory(fCategoryNumber).pipe(
      catchError(error => {
        this.errorMessage = '目前沒有文章。'; // 設置錯誤訊息
        console.error('加載文章時發生錯誤:', error);
        return of([]); // 返回空陣列
      })
    ).subscribe((data: ITArticle[]) => {
      this.articles = data;
      this.filteredArticles = data;
      this.pagedArticles = this.filteredArticles.slice(0, this.pageSize); // 初始化分頁

      this.loadMemberNames(); // 加載會員名稱
    });
  }

  // 加載類別名稱
  loadCategoryName(fCategoryNumber: number): void {
    this.categoryService.getCategoryNameByNumber(fCategoryNumber).pipe(
      catchError(error => {
        console.error('加載類別名稱時發生錯誤:', error );
        return of('未知分類'); // 返回未知分類
      })
    ).subscribe(name => {
      this.categoryName = name || '未知分類'; // 設置類別名稱
    });
  }

  // 過濾文章
  filterArticles(event: any): void {
    if (event && event.type === 'compositionend') {
      this.performSearch(); // 執行搜尋
    } else if (!event || event.type === 'input') {
      this.performSearch(); // 執行搜尋
    }
    this.pagedArticles = this.filteredArticles.slice(0, this.pageSize); // 更新分頁
  }

  // 執行搜尋
  private performSearch(): void {
    if (this.searchTerm) {
      this.filteredArticles = this.articles.filter(article =>
        article && article.fArticleName &&
        article.fArticleName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredArticles = this.articles;
    }
  }

  // 刪除文章
  deleteArticle(articleId: number): void {
    Swal.fire({
      title: '確定要刪除嗎？',
      text: '刪除後將無法復原！',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6495ed',
      cancelButtonColor: '#E6005C',
      confirmButtonText: '是的，刪除！',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        this.articleService.deleteArticle(articleId).subscribe({
          next: () => {
            this.articles = this.articles.filter(article => article.fArticleID !== articleId);
            this.performSearch(); // 更新搜尋結果
            this.pagedArticles = this.filteredArticles.slice(0, this.pageSize); // 更新分頁

            Swal.fire({
              title: '已刪除！',
              text: '文章已成功刪除。',
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#019858',
              timer: 1500
            });
          },
          error: (error) => {
            console.error('刪除文章失敗:', error);
            Swal.fire({
              title: '錯誤！',
              text: '刪除文章失敗，請稍後再試。',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  // 分頁變更事件
  onPageChange(event: any) {
    const startIndex = event.first;
    const endIndex = startIndex + event.rows;
    this.pageSize = event.rows;
    this.currentPage = Math.floor(startIndex / this.pageSize) + 1;
    this.pagedArticles = this.filteredArticles.slice(startIndex, endIndex); // 更新分頁
  }

  // 限制顯示的文字長度
  limitText(html: string, limit: number = 5): string {
    if (!html) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const plainText = tempDiv.textContent || tempDiv.innerText;

    if (plainText.length <= limit) {
      return html;
    }

    const truncatedText = plainText.slice(0, limit) + '...';

    return `<p>${truncatedText}</p>`;
  }

  // 安全地顯示 HTML
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // 判斷是否為文章作者
  isArticleAuthor(articleMemberId: number): boolean {
    return this.currentMemberId === articleMemberId;
  }

  // 加載會員名稱
  loadMemberNames(): void {
    this.memberLoading = true;
    const memberIds = new Set(this.articles.map(article => article.fMemberID));

    const promises = Array.from(memberIds).map(memberId =>
      this.memberService.getMemberById(memberId).toPromise()
        .then(member => {
          if (member) {
            this.memberNames[memberId] = member.fName;
          }
        })
        .catch(error => {
          console.error(`無法載入會員 ${memberId} 的資料:`, error);
          this.memberNames[memberId] = `會員 ${memberId}`;
        })
    );

    Promise.all(promises).finally(() => {
      this.memberLoading = false;
    });
  }

  // 獲取會員名稱
  getMemberName(memberId: number): string {
    if (this.memberLoading) {
      return '載入中...';
    }
    return this.memberNames[memberId] || `會員 ${memberId}`;
  }

  // 滾動到新文章
  scrollToNewArticle(articleId: number): void {
    const articleIndex = this.articles.findIndex(a => a.fArticleID === articleId);
    if (articleIndex === -1) return;

    const pageIndex = Math.floor(articleIndex / this.pageSize);
    this.currentPage = pageIndex + 1;

    const event = {
      first: pageIndex * this.pageSize,
      rows: this.pageSize,
      page: pageIndex
    };
    this.onPageChange(event);

    setTimeout(() => {
      const articleElement = document.querySelector(`[data-article-id="${articleId}"]`);
      if (articleElement) {
        articleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        articleElement.classList.add('highlight-new-article');
        setTimeout(() => {
          articleElement.classList.remove('highlight-new-article');
        }, 3000);
      }
    }, 100);
  }
}
