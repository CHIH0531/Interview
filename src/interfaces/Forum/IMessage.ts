export interface IMessage {
  fMessageId: number;         // 留言的 ID
  fArticleId: number;          // 所屬文章的 ID
  fMemberId: number;           // 留言會員的 ID
  fMessageContent: string;     // 留言內容
  fCreatedAt: string;          // 留言建立時間
  fUpdatedAt?: string;         // 留言更新時間，可為空值
  fMember?: {
    fMemberId: number;
    fName: string;
  };
  fArticle?: {
    fArticleId: number;
    fArticleName: string;
    fArticleContent: string;
  };
}
