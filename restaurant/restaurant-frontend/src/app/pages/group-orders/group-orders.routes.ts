import { Routes } from '@angular/router';
import { GroupOrdersListComponent } from '../../components/group-orders/group-orders-list.component';
import { CreateGroupOrderComponent } from '../../components/group-orders/create-group-order.component';
import { ParticipateGroupOrderComponent } from '../../components/group-orders/participate-group-order.component';
import { GroupOrderDetailsComponent } from '../../components/group-orders/group-order-details.component';

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
                path: 'details/:id',
                component: GroupOrderDetailsComponent,
            },
            {
                path: 'participate/:id',
                component: ParticipateGroupOrderComponent,
            },
        ],
    },
];
