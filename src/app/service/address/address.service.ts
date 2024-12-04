import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Address } from '../../model/address';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly apiUrl = 'http://localhost:8080/addresses';

  private addressesSubject = new BehaviorSubject<Address[]>([]);
  public readonly addresses$ = this.addressesSubject.asObservable();

  constructor(private http: HttpClient, private authentication: AuthenticationService) { }

  /**
   * Fetches the list of all addresses from the API.
   * Updates the internal address state on success.
   *
   * @returns Observable<Address[]> - Observable emitting the list of addresses.
   */
  public getAddresses(): Observable<Address[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.get<Address[]>(this.apiUrl, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, `Failed to fetch addresses`)),
      tap((addresses) => this.addressesSubject.next(addresses))
    );
  }

  /**
   * Fetches a single address by its ID.
   *
   * @param id - The ID of the address to fetch.
   * @returns Observable<Address> - Observable emitting the requested address.
   */
  public getAddress(id: number): Observable<Address> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.get<Address>(`${this.apiUrl}/${id}`, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, `Failed to fetch address with ID ${id}`))
    );
  }

  /**
   * Deletes a address by its ID.
   * Updates the internal address state by removing the deleted address.
   *
   * @param id - The ID of the address to delete.
   * @returns Observable<void> - Observable that completes when the deletion is successful.
   */
  public deleteAddress(id: number): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, `Failed to delete address with ID ${id}`)),
      tap(() => {
        const updatedAddresses = this.addressesSubject.getValue().filter(p => p.id !== id);
        this.addressesSubject.next(updatedAddresses);
      })
    );
  }

  /**
   * Updates multiple addresses in parallel.
   *
   * @param addresses - An array of partial address objects with updated fields.
   * @returns Observable<Address[]> - Observable emitting the list of updated addresses.
   */
  public updateAddresses(addresses: Partial<Address>[]): Observable<Address[]> {
    const updateRequests = addresses.map(address =>
      this.updateAddress(address.id!, address)
    );

    return forkJoin(updateRequests).pipe(
      catchError((error) => this.handleError(error, 'Failed to update addresses')),
      tap((updatedAddresses) => {
        this.addressesSubject.next(updatedAddresses);
      })
    );
  }

  /**
   * Updates a single address by its ID.
   * Updates the internal address state with the modified address.
   *
   * @param id - The ID of the address to update.
   * @param addressData - Partial address data containing fields to update.
   * @returns Observable<Address> - Observable emitting the updated address.
   */
  public updateAddress(id: number, addressData: Partial<Address>): Observable<Address> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.put<Address>(`${this.apiUrl}/${id}`, addressData, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, 'Failed to update address')),
      tap((updatedAddress) => {
        const currentAddresses = this.addressesSubject.getValue();
        const updatedAddresses = currentAddresses.map(address =>
          address.id === id ? { ...address, ...updatedAddress } : address
        );
        this.addressesSubject.next(updatedAddresses);
      })
    );
  }

  /**
   * Creates a new address and adds it to the address list.
   * Updates the internal address state by appending the new address.
   *
   * @param address - The address data to create.
   * @returns Observable<Address> - Observable emitting the created address.
   */
  public createAddress(address: any): Observable<Address> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authentication.getToken()}`);

    return this.http.post<Address>(this.apiUrl, address, { 'headers': headers }).pipe(
      catchError((error) => this.handleError(error, 'Failed to create address')),
      tap((newAddress) => {
        const updatedAddresses = [...this.addressesSubject.getValue(), newAddress];
        this.addressesSubject.next(updatedAddresses);
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
