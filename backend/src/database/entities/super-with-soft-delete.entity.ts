import { DeleteDateColumn } from 'typeorm';
import { SuperEntity } from './super.entity';

export abstract class SuperWithSoftDeleteEntity extends SuperEntity {
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
