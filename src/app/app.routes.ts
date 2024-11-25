import { Routes } from '@angular/router';
import { ContactListViewComponent } from './component/list-view/contact/contact-list-view.component';
import { CalendarViewComponent } from './component/calendar-view/calendar-view.component';
import { ProductListViewComponent } from './component/list-view/product/product-list-view.component';

export const routes: Routes = [
    {
        path: "contact/list-view",
        component: ContactListViewComponent
    },
    {
        path: "product/list-view",
        component: ProductListViewComponent
    },
    {
        path: "calendar-view",
        component: CalendarViewComponent
    },
    {
        path: "**",
        redirectTo: "",
        pathMatch: "full"
    }
];
