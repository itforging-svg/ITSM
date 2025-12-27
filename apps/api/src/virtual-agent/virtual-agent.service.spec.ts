import { Test, TestingModule } from '@nestjs/testing';
import { VirtualAgentService } from './virtual-agent.service';

describe('VirtualAgentService', () => {
  let service: VirtualAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VirtualAgentService],
    }).compile();

    service = module.get<VirtualAgentService>(VirtualAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
