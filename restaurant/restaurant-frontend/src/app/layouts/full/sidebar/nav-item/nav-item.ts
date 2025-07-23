export interface NavItem {
    displayName?: string;
    iconName?: string; // Use 'category' for Categories nav item
    navCap?: string;
    route?: string;
    children?: NavItem[];
    chip?: boolean;
    chipContent?: string;
    chipClass?: string;
    external?: boolean;
}
