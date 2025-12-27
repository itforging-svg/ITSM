import { Test, TestingModule } from '@nestjs/testing';
import { VirtualAgentGateway } from './virtual-agent.gateway';

describe('VirtualAgentGateway', () => {
  let gateway: VirtualAgentGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VirtualAgentGateway],
    }).compile();

    gateway = module.get<VirtualAgentGateway>(VirtualAgentGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
