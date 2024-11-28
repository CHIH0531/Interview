import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { STCategoryService } from '../../../../services/Forum/STCategory';
import { ITCategory } from '../../../../interfaces/Forum/ITCategory';
import { LoginService } from '../../../../services/Member/login.service';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  categories: ITCategory[] = []; // 儲存所有類別的陣列
  selectedCategory: ITCategory | null = null; // 當前選擇的類別
  selectedCategoryName: string = ''; // 儲存選擇的類別名稱
  newCategory: ITCategory = { fCategoryNumber: 0, fCategoryName: '' }; // 初始化 newCategory
  searchTerm: string = ''; // 搜尋關鍵字

  constructor(
    private categoryService: STCategoryService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories(); // 初始化時加載類別
  }

  loadCategories(): void {
    // 從服務中獲取類別資料
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data; // 將獲取到的類別資料賦值給 categories
    });
  }

  // 過濾類別，根據搜尋關鍵字返回符合的類別
  filteredCategories(): ITCategory[] {
    return this.categories.filter(category =>
      (category.fCategoryName || '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // 更新類別資料
  updateCategory(category: ITCategory): void {
    if (category) {
      this.categoryService.updateCategory(category).subscribe(() => {
        this.loadCategories(); // 更新後重新加載類別
        this.clearSelection();  // 清除選擇
      });
    }
  }

  // 選擇類別並獲取其名稱
  selectCategory(category: ITCategory): void {
    this.selectedCategory = category; // 設置當前選擇的類別
    this.newCategory = { ...category }; // 將選擇的類別資料複製到 newCategory

    // 獲取所選類別的名稱
    this.categoryService.getCategoryNameByNumber(category.fCategoryNumber).subscribe(name => {
      this.selectedCategoryName = name; // 儲存所選類別的名稱
    });
  }

  // 清除當前選擇的類別
  clearSelection(): void {
    this.selectedCategory = null; // 清除當前選擇的類別
    this.selectedCategoryName = ''; // 重置所選類別名稱
    this.newCategory = { fCategoryNumber: 0, fCategoryName: '' }; // 重置 newCategory
  }

  // 新增登出方法
  logout(): void {
    // 清除 localStorage 中的會員資訊
    this.loginService.clearMemberId();

    // 導向登入頁面
    this.router.navigate(['/login']);
  }
}
