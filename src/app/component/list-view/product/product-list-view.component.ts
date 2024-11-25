import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LIST_CONFIG } from '../list-view.config';
import { BaseListViewComponent } from '../base-list-view.component';
import { Product } from '../../../model/product';
import { ProductService } from '../../../service/product/product.service';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: '../list-view.component.html',
  styleUrl: '../list-view.component.scss',
  providers: [{
        provide: LIST_CONFIG,
        useValue: {
            pageSize: 10,
            sortable: true,
            filterable: true,
            columns: [
                { key: 'name', label: 'Nom', sortable: true, filterable: true },
                { key: 'price', label: 'Prix', sortable: true },
                { key: 'category', label: 'Catégorie', sortable: true, filterable: true }
            ],
            actions: {
                edit: true,
                delete: true,
                view: true
            }
        }
    }]
})
export class ProductListViewComponent extends BaseListViewComponent<Product> {
    private productService: ProductService = inject(ProductService);

    private ngOnInit(): void {
        this.loadProducts();
    }

    private loadProducts() {
        this.productService.getProducts().subscribe(
            products => {
                this.items = products;
            }
        );
    }

    protected getItemValue(item: Product, key: string): any {
        return item[key as keyof Product];
    }

    protected override sortBy(column: string): void {
        super.sortBy(column);

        if(this.sortOrder == 0) {
            switch(column) {
                case 'name':
                    this.items.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                    
                case 'price':
                    this.items.sort((a, b) => a.price - b.price);
                    break;
                    
                case 'category':
                    this.items.sort((a, b) => a.category.name.localeCompare(b.category.name));
                    break;
            }
        }

        else if(this.sortOrder == 1) {
            switch(column) {
                case 'name':
                    this.items.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                
                case 'price':
                    this.items.sort((a, b) => b.price - a.price);
                    break;

                case 'category':
                    this.items.sort((a, b) => b.category.name.localeCompare(a.category.name));
                    break;
            }
        }

        else {
            this.items.sort((a, b) => a.id - b.id);
        }
    }

    protected override filter(column: string, value: string): void {
        super.filter(column, value);

        this.items = this.items.filter( (product) => this.getItemValue(product, column).includes(value) );
      }
    
    protected override delete(id: number): void {
        super.delete(id);
        this.productService.deleteProduct(id).subscribe({
            next: data => {
                console.log('Delete successful');
                this.loadProducts();
            },
            error: error => {
                console.error('There was an error!', error);
            }
        });
    }
}