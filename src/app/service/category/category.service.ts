import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Category } from '../../model/category';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = 'http://localhost:8080/categories';

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public readonly categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient, private authentication: AuthenticationService) { }

  /**
   * Fetches the list of all categories from the API.
   * Updates the internal category state on success.
   *
   * @returns Observable<Category[]> - Observable emitting the list of categories.
   */
  public getCategories(): Observable<Category[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.get<Category[]>(this.apiUrl, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, `Failed to fetch categories`)),
      tap((categories) => this.categoriesSubject.next(categories))
    );
  }

  /**
   * Fetches a single category by its ID.
   *
   * @param id - The ID of the category to fetch.
   * @returns Observable<Category> - Observable emitting the requested category.
   */
  public getCategory(id: number): Observable<Category> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.get<Category>(`${this.apiUrl}/${id}`, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, `Failed to fetch category with ID ${id}`))
    );
  }

  /**
   * Deletes a category by its ID.
   * Updates the internal category state by removing the deleted category.
   *
   * @param id - The ID of the category to delete.
   * @returns Observable<void> - Observable that completes when the deletion is successful.
   */
  public deleteCategory(id: number): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, `Failed to delete category with ID ${id}`)),
      tap(() => {
        const updatedCategories = this.categoriesSubject.getValue().filter(p => p.id !== id);
        this.categoriesSubject.next(updatedCategories);
      })
    );
  }

  /**
   * Updates multiple categories in parallel.
   *
   * @param categories - An array of partial category objects with updated fields.
   * @returns Observable<Category[]> - Observable emitting the list of updated categories.
   */
  public updateCategories(categories: Partial<Category>[]): Observable<Category[]> {
    const updateRequests = categories.map(category =>
      this.updateCategory(category.id!, category)
    );

    return forkJoin(updateRequests).pipe(
      catchError((error) => this.handleError(error, 'Failed to update categories')),
      tap((updatedCategories) => {
        this.categoriesSubject.next(updatedCategories);
      })
    );
  }

  /**
   * Updates a single category by its ID.
   * Updates the internal category state with the modified category.
   *
   * @param id - The ID of the category to update.
   * @param categoryData - Partial category data containing fields to update.
   * @returns Observable<Category> - Observable emitting the updated category.
   */
  public updateCategory(id: number, categoryData: Partial<Category>): Observable<Category> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.put<Category>(`${this.apiUrl}/${id}`, categoryData, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, 'Failed to update category')),
      tap((updatedCategory) => {
        const currentCategories = this.categoriesSubject.getValue();
        const updatedCategories = currentCategories.map(category =>
          category.id === id ? { ...category, ...updatedCategory } : category
        );
        this.categoriesSubject.next(updatedCategories);
      })
    );
  }

  /**
   * Creates a new category and adds it to the category list.
   * Updates the internal category state by appending the new category.
   *
   * @param category - The category data to create.
   * @returns Observable<Category> - Observable emitting the created category.
   */
  public createCategory(category: any): Observable<Category> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.post<Category>(this.apiUrl, category, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, 'Failed to create category')),
      tap((newCategory) => {
        const updatedCategories = [...this.categoriesSubject.getValue(), newCategory];
        this.categoriesSubject.next(updatedCategories);
      })
    );
  }

  /**
   * Handles HTTP errors by logging and rethrowing them.
   *
   * @param error - The HTTP error response object.
   * @param errorMessage - Custom error message to log.
   * @returns Observable<never> - Throws an error observable with the custom message.
   */
  private handleError(error: HttpErrorResponse, errorMessage?: string) {
    console.error(`${errorMessage}`, error);
    return throwError(() => new Error(errorMessage));
  }
}
