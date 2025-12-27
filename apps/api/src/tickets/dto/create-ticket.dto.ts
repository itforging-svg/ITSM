export class CreateTicketDto {
    subject: string;
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class UpdateTicketDto {
    status?: 'new' | 'open' | 'pending' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignee_id?: string;
}
