import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VirtualAgentService } from '../virtual-agent.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class VirtualAgentGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private virtualAgentService: VirtualAgentService) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { sessionId: string | null; message: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.virtualAgentService.processMessage(data.userId, data.sessionId, data.message);
    client.emit('receive_message', result);
  }
}
