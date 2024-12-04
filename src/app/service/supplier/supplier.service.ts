import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Supplier } from '../../model/supplier';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly apiUrl = 'http://localhost:8080/suppliers';

  private suppliersSubject = new BehaviorSubject<Supplier[]>([]);
  public readonly suppliers$ = this.suppliersSubject.asObservable();

  constructor(private http: HttpClient, private authentication: AuthenticationService) { }

  /**
   * Fetches the list of all suppliers from the API.
   * Updates the internal supplier state on success.
   *
   * @returns Observable<Supplier[]> - Observable emitting the list of suppliers.
   */
  public getSuppliers(): Observable<Supplier[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.get<Supplier[]>(this.apiUrl, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, `Failed to fetch suppliers`)),
      tap((suppliers) => this.suppliersSubject.next(suppliers))
    );
  }

  /**
   * Fetches a single supplier by its ID.
   *
   * @param id - The ID of the supplier to fetch.
   * @returns Observable<Supplier> - Observable emitting the requested supplier.
   */
  public getSupplier(id: number): Observable<Supplier> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.get<Supplier>(`${this.apiUrl}/${id}`, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, `Failed to fetch supplier with ID ${id}`))
    );
  }

  /**
   * Deletes a supplier by its ID.
   * Updates the internal supplier state by removing the deleted supplier.
   *
   * @param id - The ID of the supplier to delete.
   * @returns Observable<void> - Observable that completes when the deletion is successful.
   */
  public deleteSupplier(id: number): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, `Failed to delete supplier with ID ${id}`)),
      tap(() => {
        const updatedSuppliers = this.suppliersSubject.getValue().filter(p => p.id !== id);
        this.suppliersSubject.next(updatedSuppliers);
      })
    );
  }

  /**
   * Updates multiple suppliers in parallel.
   *
   * @param suppliers - An array of partial supplier objects with updated fields.
   * @returns Observable<Supplier[]> - Observable emitting the list of updated suppliers.
   */
  public updateSuppliers(suppliers: Partial<Supplier>[]): Observable<Supplier[]> {
    const updateRequests = suppliers.map(supplier =>
      this.updateSupplier(supplier.id!, supplier)
    );

    return forkJoin(updateRequests).pipe(
      catchError((error) => this.handleError(error, 'Failed to update suppliers')),
      tap((updatedSuppliers) => {
        this.suppliersSubject.next(updatedSuppliers);
      })
    );
  }

  /**
   * Updates a single supplier by its ID.
   * Updates the internal supplier state with the modified supplier.
   *
   * @param id - The ID of the supplier to update.
   * @param supplierData - Partial supplier data containing fields to update.
   * @returns Observable<Supplier> - Observable emitting the updated supplier.
   */
  public updateSupplier(id: number, supplierData: Partial<Supplier>): Observable<Supplier> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplierData, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, 'Failed to update supplier')),
      tap((updatedSupplier) => {
        const currentSuppliers = this.suppliersSubject.getValue();
        const updatedSuppliers = currentSuppliers.map(supplier =>
          supplier.id === id ? { ...supplier, ...updatedSupplier } : supplier
        );
        this.suppliersSubject.next(updatedSuppliers);
      })
    );
  }

  /**
   * Creates a new supplier and adds it to the supplier list.
   * Updates the internal supplier state by appending the new supplier.
   *
   * @param supplier - The supplier data to create.
   * @returns Observable<Supplier> - Observable emitting the created supplier.
   */
  public createSupplier(supplier: any): Observable<Supplier> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.post<Supplier>(this.apiUrl, supplier, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, 'Failed to create supplier')),
      tap((newSupplier) => {
        const updatedSuppliers = [...this.suppliersSubject.getValue(), newSupplier];
        this.suppliersSubject.next(updatedSuppliers);
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
