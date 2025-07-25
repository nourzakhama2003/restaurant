import { Routes } from '@angular/router';
import { GroupOrdersListComponent } from '../../components/group-orders/group-orders-list.component';
import { CreateGroupOrderComponent } from '../../components/group-orders/create-group-order.component';
import { GroupOrderDetailsComponent } from '../../components/group-orders/group-order-details.component';
import { MyOrdersComponent } from '../../components/group-orders/my-orders.component';

export const GroupOrderRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: GroupOrdersListComponent,
            },
            {
                path: 'create',
                component: CreateGroupOrderComponent,
            },
            {
                path: 'my-orders',
                component: MyOrdersComponent,
            },
            {
                path: 'details/:id',
                component: GroupOrderDetailsComponent,
            },
        ],
    },
];
