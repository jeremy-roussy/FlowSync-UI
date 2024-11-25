import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../model/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  readonly apiUrl = "http://localhost:8080";

  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products = this.productsSubject.asObservable();

  constructor(private http: HttpClient) { }

  public getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`)
      .pipe(
        catchError(() => {
          this.productsSubject.error('An error occurred');
          return [];
        }),
        map((products) => {
          // traitement des données avant de mettre à jour l'état courant
          return products;
        })
      );
  }

  public deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }
}
