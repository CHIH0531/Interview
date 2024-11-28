import { ITCategory } from './ITCategory'; // 引入 ITCategory 接口

export interface ITArticle {
  fArticleID: number;                // 文章 ID
  fArticleName?: string;             // 文章名稱 (可選)
  fArticleContent?: string;          // 文章內容 (可選)
  fCategoryNumber: number;           // 類別編號
  fMemberID: number;                 // 作者 ID
  fCreatedAt?: Date;                  // 創建時間
  fUpdatedAt?: Date;                  // 修改時間（可以為 null）
  fCategoryNumberNavigation?: ITCategory; // 類別導航 (可選)
}
