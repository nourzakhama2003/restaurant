export interface OrderItem {
    menuItemId: string;
    menuItemName: string;
    unitPrice: number;
    quantity: number;
    notes?: string;
}

export interface Order {
    id: string;
    commandeId: string;
    participantId: string;
    participantName: string;
    participantPhone: string;
    items: OrderItem[];
    totalAmount: number;
    notes?: string;
    createdAt: Date;
    deleted?: boolean;
}

/**
 * Command model matching the backend structure
 * Status lifecycle: created -> closed (automatically when orderDeadline passes) -> confirmed -> cancelled
 */
export interface Command {
    id: string;
    restaurantId: string;
    creatorId: string;
    creatorName: string;
    status: CommandStatus; // Required status field
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    orderDeadline: Date; // Full date and time when order participation closes
    orders: Order[];
    deleted: boolean;
}

/**
 * Command status enumeration
 */
export enum CommandStatus {
    CREATED = 'created',     // Initial status when command is created
    CLOSED = 'closed',       // Automatically set when orderDeadline passes
    CONFIRMED = 'confirmed', // Manually set by creator after review
    CANCELLED = 'cancelled'  // Manually set if command is cancelled
}

/**
 * Request model for creating a new command
 */
export interface CreateCommandRequest {
    restaurantId: string;
    creatorId: string;
    creatorName: string;
    orderDeadline: Date;
}

/**
 * Request model for updating command status
 */
export interface UpdateCommandStatusRequest {
    commandId: string;
    status: CommandStatus;
}

/**
 * Request model for participating in a command
 */
export interface ParticipateRequest {
    commandeId: string;
    participantId: string;
    participantName: string;
    participantPhone: string;
    items: OrderItem[];
    notes?: string;
}

/**
 * Response model for command operations
 */
export interface CommandResponse {
    success: boolean;
    message?: string;
    command?: Command;
}

/**
 * Model for command statistics
 */
export interface CommandStats {
    totalCommands: number;
    activeCommands: number;
    closedCommands: number;
    confirmedCommands: number;
    cancelledCommands: number;
    totalParticipants: number;
    totalRevenue: number;
}

/**
 * Filter options for commands
 */
export interface CommandFilters {
    status?: CommandStatus[];
    restaurantId?: string;
    creatorId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    includeDeleted?: boolean;
}

/**
 * Pagination options for command lists
 */
export interface CommandPagination {
    page: number;
    size: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Command list response with pagination
 */
export interface CommandListResponse {
    commands: Command[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

/**
 * Utility functions for command status management
 */
export class CommandUtils {
    /**
     * Check if a command can accept new participants
     */
    static canAcceptParticipants(command: Command): boolean {
        return command.status === CommandStatus.CREATED &&
            new Date() < new Date(command.orderDeadline) &&
            !command.deleted;
    }

    /**
     * Check if a command should be automatically closed
     */
    static shouldAutoClose(command: Command): boolean {
        return command.status === CommandStatus.CREATED &&
            new Date() >= new Date(command.orderDeadline);
    }

    /**
     * Get display text for command status
     */
    static getStatusDisplayText(status: CommandStatus): string {
        switch (status) {
            case CommandStatus.CREATED:
                return 'Ouvert aux participations';
            case CommandStatus.CLOSED:
                return 'Fermé aux participations';
            case CommandStatus.CONFIRMED:
                return 'Confirmé';
            case CommandStatus.CANCELLED:
                return 'Annulé';
            default:
                return status;
        }
    }

    /**
     * Get CSS class for command status styling
     */
    static getStatusCssClass(status: CommandStatus): string {
        switch (status) {
            case CommandStatus.CREATED:
                return 'status-created';
            case CommandStatus.CLOSED:
                return 'status-closed';
            case CommandStatus.CONFIRMED:
                return 'status-confirmed';
            case CommandStatus.CANCELLED:
                return 'status-cancelled';
            default:
                return 'status-unknown';
        }
    }

    /**
     * Calculate time remaining until order deadline
     */
    static getTimeRemaining(orderDeadline: Date): string {
        const now = new Date();
        const deadline = new Date(orderDeadline);
        const diff = deadline.getTime() - now.getTime();

        if (diff <= 0) {
            return 'Expiré';
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days} jour${days > 1 ? 's' : ''}`;
        }

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    }

    /**
     * Format command creation date
     */
    static formatCreatedDate(createdAt: Date): string {
        return new Date(createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Format order deadline
     */
    static formatOrderDeadline(orderDeadline: Date): string {
        return new Date(orderDeadline).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
