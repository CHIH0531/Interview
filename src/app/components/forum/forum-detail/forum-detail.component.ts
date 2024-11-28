import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { STArticleService } from '../../../../services/Forum/STArticle';
import { SMessage } from '../../../../services/Forum/SMessage';
import { ITArticle } from '../../../../interfaces/Forum/ITArticle';
import { IMessage } from '../../../../interfaces/Forum/IMessage';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DTMessageCreate } from '../../../../interfaces/Forum/IMessageCreate';
import { FTMemberService } from '../../../../services/Forum/SFTMember';
import { AuthGuardDemoService } from '../../../../services/Workflow/auth-guard-demo/auth-guard-demo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forum-detail',
  templateUrl: './forum-detail.component.html',
  styleUrls: ['./forum-detail.component.css']
})
export class ForumDetailComponent implements OnInit {
  article!: ITArticle; // 文章資料
  authorName: string = ''; // 新增作者名稱
  messageAuthors: { [key: number]: string } = {}; // 新增留言作者名稱映射
  newMessageContent: string = ''; // 新增留言的內容
  messages: IMessage[] = []; // 存放此文章的留言
  isSubmitting = false; // 新增：防止重複提交
  pageSize: number = 10;
  pagedMessages: any[] = [];
  currentPage: number = 1 ;
  currentMemberId: number | null = null;  //  添加此屬性
  isEditing = false;
  editingMessageId: number | null = null;
  originalContent: string = '';
  currentScrollPosition: number = 0;

  // 新增 demo 留言內容
  demoMessageContent: string = `
您好,
小公司的人資工作雖然包山包海，但是讓您可以學到選、用、育、留等人資管理功能，薪資水準或許不高，但對您在人資管理專業與實務歷練的成長很快，如果您同時能透過自學或是訓練課程強化專業，很快就可以成為全方位的人資主管。建議您可以在104求職精靈平台，持續使用專業職能測驗與免費的線上學習課程。
小公司有可能成為中大型或是上市櫃公司，如果您剛好遇到潛力股，相信您的職涯會跟公司共同成長。請您持續累積人資管理的專業與工作績效，不管是大小公司都會歡迎您任職的。
以上淺見請您參考。`;

  constructor(
    private articleService: STArticleService,
    private messageService: SMessage,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private memberService: FTMemberService,
    private authGuardService: AuthGuardDemoService  // 注入 AuthGuardDemoService
  ) {
    this.currentMemberId = this.authGuardService.getMemberId();
  }

  ngOnInit(): void {
    const articleId = +this.route.snapshot.paramMap.get('fArticleID')!;
    this.loadArticle(articleId);
    this.loadMessages(articleId);
  }

  // 載入文章資料
  loadArticle(articleId: number): void {
    this.articleService.getArticleById(articleId).subscribe({
      next: (article) => {
        this.article = article;
        // 載入作者名稱
        this.memberService.getMemberById(article.fMemberID).subscribe({
          next: (member) => {
            this.authorName = member.fName;
          },
          error: (error) => {
            console.error('載入作者資訊失敗', error);
            this.authorName = '未知用戶';
          }
        });
      },
      error: (error) => {
        console.error('載入文章失敗', error);
        Swal.fire({
          title: '錯誤',
          text: '無法載入文章，請稍後再試。',
          icon: 'error',
          confirmButtonColor: '#6495ed'
        });
      }
    });
  }

  // 載入文章留言
  loadMessages(articleId: number): void {
    this.messageService.getMessagesByArticleId(articleId).subscribe({
      next: (response: any) => {
        if (response.success) {
          // 將留言按照建立時間從舊到新排序
          this.messages = response.data.sort((a: IMessage, b: IMessage) =>
            new Date(a.fCreatedAt).getTime() - new Date(b.fCreatedAt).getTime()
          );

          // 載入所有留言作者的名稱
          this.messages.forEach(message => {
            this.memberService.getMemberById(message.fMemberId).subscribe({
              next: (member) => {
                this.messageAuthors[message.fMemberId] = member.fName;
              },
              error: () => {
                this.messageAuthors[message.fMemberId] = '未知用戶';
              }
            });
          });

          // 更新分頁顯示
          this.updatePagedMessages();
        }
      },
      error: (error) => {
        console.error('載入留言失敗', error);
        Swal.fire({
          title: '錯誤',
          text: '無法載入留言，請稍後再試。',
          icon: 'error',
          confirmButtonColor: '#6495ed'
        });
      }
    });
  }

  updatePagedMessages(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedMessages = this.messages.slice(startIndex, endIndex);

    // 如果當前頁面沒有資料且不是第一頁，則回到前一頁
    if (this.pagedMessages.length === 0 && this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedMessages();
    }
  }

  // 提交新留言
  submitMessage(): void {
    const currentScrollPosition = window.scrollY; // 獲取當前滾動位置

    if (this.isSubmitting) return;

    // 檢查是否已登入
    if (!this.authGuardService.isLoggedIn()) {
      Swal.fire({
        title: '請先登入',
        text: '請先登入後再留言',
        icon: 'warning',
        confirmButtonColor: '#6495ed'
      }).then(() => {
        this.authGuardService.redirectToLogin();
      });
      return;
    }

    const content = this.newMessageContent?.trim();

    // 檢查內容是否為空
    if (!content) {
      Swal.fire({
        title: '提示',
        text: '留言內容不可為空',
        icon: 'warning',
        confirmButtonColor: '#6495ed'
      });
      return;
    }

    // 檢查內容長度
    if (content.length > 10000) {
      Swal.fire({
        title: '提示',
        text: '留言內容不可超過 10000 字元',
        icon: 'warning',
        confirmButtonColor: '#6495ed'
      });
      return;
    }

    this.isSubmitting = true;

    if (this.isEditing && this.editingMessageId) {
      this.messageService.updateMessage(this.editingMessageId, {
        fMessageContent: this.newMessageContent.trim()
      }).subscribe({
        next: (response) => {
          // 更新本地留言列表
          this.messages = this.messages.map(msg =>
            msg.fMessageId === this.editingMessageId
              ? { ...msg, fMessageContent: this.newMessageContent.trim() }
              : msg
          );

          // 計算編輯的留言在第幾頁
          const messageIndex = this.messages.findIndex(m => m.fMessageId === this.editingMessageId);
          const targetPage = Math.floor(messageIndex / this.pageSize) + 1;

          // 如果目標頁面與當前頁面不同，先切換頁面
          if (this.currentPage !== targetPage) {
            this.currentPage = targetPage;
          }

          this.updatePagedMessages();

          // 使用 Promise 和 setTimeout 確保 DOM 更新
          Promise.resolve().then(() => {
            setTimeout(() => {
              // 滾動到之前記錄的位置
              window.scrollTo(0, this.currentScrollPosition);
            }, 100);
          });

          this.cancelEdit();

          Swal.fire({
            title: '成功',
            text: '留言更新成功！',
            icon: 'success',
            timer: 1500,
            confirmButtonColor: '#6495ed'
          });

          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('更新留言失敗:', error);
          Swal.fire({
            title: '錯誤',
            text: '更新留言失敗，請稍後再試。',
            icon: 'error',
            confirmButtonColor: '#6495ed'
          });
          this.isSubmitting = false;
        }
      });
    } else {
      // 取得當前登入的會員 ID
      const currentMemberId = this.authGuardService.getMemberId();

      if (!currentMemberId) {
        Swal.fire({
          title: '請先登入',
          text: '請先登入後再留言',
          icon: 'warning',
          confirmButtonColor: '#6495ed'
        }).then(() => {
          this.authGuardService.redirectToLogin();
        });
        return;
      }

      const newMessage: DTMessageCreate = {
          fArticleId: this.article.fArticleID,
          fMemberId: currentMemberId,  // 使用當前登入的會員 ID
          fMessageContent: content
      };

      console.log('準備送出的留言:', newMessage);

      this.messageService.addMessage(newMessage).subscribe({
          next: (response) => {
              console.log('留言新增成功:', response);
              // 載入新留言的作者名稱
              this.memberService.getMemberById(response.fMemberId).subscribe({
                next: (member) => {
                  this.messageAuthors[response.fMemberId] = member.fName;
                },
                error: () => {
                  this.messageAuthors[response.fMemberId] = '未知用戶';
                }
              });

              // 添加新留言到陣列
              this.messages = [...this.messages, response];
              this.newMessageContent = '';

              // 計算新留言應該在第幾頁
              const totalMessages = this.messages.length;
              const lastPage = Math.ceil(totalMessages / this.pageSize);

              // 更新到最後一頁
              this.currentPage = lastPage;
              this.updatePagedMessages();

              // 等待 DOM 更新後滾動到新留言
              setTimeout(() => {
                  const messagesContainer = document.querySelector('.forum-messages');
                  const messageItems = document.querySelectorAll('.message-item');
                  const lastMessage = messageItems[messageItems.length - 1];

                  if (lastMessage) {
                      // 添加高亮效果
                      lastMessage.classList.add('highlight-new-message');

                      // 滾動到新留言
                      lastMessage.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center'
                      });

                      // 3秒後移除高亮效果
                      setTimeout(() => {
                          lastMessage.classList.remove('highlight-new-message');
                      }, 3000);
                  }
              }, 100);

              Swal.fire({
                title: '成功',
                text: '留言新增成功！',
                icon: 'success',
                timer: 1500,
                confirmButtonColor: '#6495ed'
              });

              this.isSubmitting = false;
          },
          error: (error) => {
              console.error('新增留言失敗:', error);
              let errorMessage = '新增留言失敗';

              // 處理特定的錯誤訊息
              if (error.error?.message) {
                  errorMessage = error.error.message;
              } else if (error.error?.errors?.FMessageContent) {
                  errorMessage = error.error.errors.FMessageContent[0];
              } else {
                  errorMessage = '留言新增失敗，請稍後再試';
              }

              Swal.fire({
                title: '錯誤',
                text: errorMessage,
                icon: 'error',
                confirmButtonColor: '#6495ed'
              });

              this.isSubmitting = false;
          }
      });
    }
  }

  // 返回列表
  goBack(): void {
    this.router.navigate(['/forum/list', this.article.fCategoryNumber]);
  }

  onMessagePageChange(event: any) {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.updatePagedMessages();

    // 滾動到留言區域頂部
    const messagesSection = document.querySelector('.forum-messages');
    if (messagesSection) {
      messagesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  sanitizeHtml(html: string | undefined): SafeHtml {
    if (!html) return this.sanitizer.bypassSecurityTrustHtml('');

    // 保留所有樣式屬性
    const cleanHtml = html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }

  // 添加這個方法
  getContentLength(): number {
    return this.newMessageContent?.trim().length || 0;
  }

  isSubmitDisabled(): boolean {
    const content = this.newMessageContent?.trim() || '';
    return this.isSubmitting || content.length === 0 || content.length > 10000;
  }

  // 添加此方法來檢查是否為留言作者
  isMessageAuthor(messageMemberId: number): boolean {
    return this.currentMemberId === messageMemberId;
  }

  // 添加刪除留言方法
  deleteMessage(messageId: number): void {
    Swal.fire({
      title: '確定刪除嗎？',
      text: '刪除後將無法復！',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6495ed',
      cancelButtonColor: '#E6005C',
      confirmButtonText: '是的，刪除！',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        this.messageService.deleteMessage(messageId).subscribe({
          next: () => {
            // 從陣列中移除被刪除的留言
            this.messages = this.messages.filter(message => message.fMessageId !== messageId);
            this.updatePagedMessages();

            Swal.fire({
              title: '已刪除！',
              text: '留言已成功刪除。',
              icon: 'success',
              timer: 1500,
              confirmButtonColor: '#6495ed'
            });
          },
          error: (error) => {
            console.error('刪除留言失敗:', error);
            Swal.fire({
              title: '錯誤！',
              text: '刪除留言失敗，請稍後再試。',
              icon: 'error',
              confirmButtonColor: '#6495ed'
            });
          }
        });
      }
    });
  }

  // 編輯留
  editMessage(message: IMessage): void {
    this.currentScrollPosition = window.scrollY;  // 記錄當前滾動位置
    this.isEditing = true;
    this.editingMessageId = message.fMessageId;
    this.newMessageContent = message.fMessageContent;
    this.originalContent = message.fMessageContent;
    // 滾動到編輯器
    document.querySelector('.forum-comment-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  // 取消編輯
  cancelEdit(): void {
    this.isEditing = false;
    this.editingMessageId = null;
    this.newMessageContent = '';
    this.originalContent = '';
  }

  // 添加跳轉方法
  scrollToCommentSection(): void {
    const commentSection = document.querySelector('.forum-comment-section');
    if (commentSection) {
      commentSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  handleTextChange(event: any): void {
    const content = event.textValue || '';
    if (content.length > 10000) {
      this.newMessageContent = content.substring(0, 10000);
      // 可選：顯示提示訊息
      Swal.fire({
        title: '提示',
        text: '留言內容已超過10000字上限',
        icon: 'warning',
        timer: 1500,
        confirmButtonColor: '#6495ed'
      });
    }
  }

  // 新增填入 demo 留言的方法
  createDemoMessage(): void {
    this.newMessageContent = this.demoMessageContent;
  }
}
