import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITCategory } from '../../interfaces/Forum/ITCategory';
import { map } from 'rxjs/operators'; // 引入 map 運算子

@Injectable({
  providedIn: 'root'
})
export class STCategoryService {
  private baseUrl = 'https://localhost:7201/api/TCategories';

  constructor(private http: HttpClient) {}

  // 根據 categoryNumber 取得特定的 CategoryName
  getCategoryNameByNumber(categoryNumber: number): Observable<string> {
    return this.http.get<ITCategory>(`${this.baseUrl}/${categoryNumber}`).pipe(
      map(category => category.fCategoryName || '未命名類別')
    );
  }

  // 取得所有分類
  getCategories(): Observable<ITCategory[]> {
    return this.http.get<ITCategory[]>(this.baseUrl);
  }

  // 創建新分類
  createCategory(category: ITCategory): Observable<ITCategory> {
    return this.http.post<ITCategory>(this.baseUrl, category);
  }

  // 更新分類
  updateCategory(category: ITCategory): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${category.fCategoryNumber}`, category);
  }

  // 刪除分類
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
