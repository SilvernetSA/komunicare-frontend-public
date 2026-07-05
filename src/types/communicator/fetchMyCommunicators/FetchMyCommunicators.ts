import type { Communicator } from '../../communicator';

export interface CommunicatorsResponse {
  data: Communicator[];
  total?: number;
  page?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  search?: string;
}
