import { Routes } from '@angular/router';
import { GroupOrdersListComponent } from '../../components/group-orders-list/group-orders-list.component';
import { CreateGroupOrderComponent } from '../../components/create-group-order.component/create-group-order.component';
import { GroupOrderDetailsComponent } from '../../components/group-order-details.component/group-order-details.component';
import { MyOrdersComponent } from '../../components/my-orders.component/my-orders.component';

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
