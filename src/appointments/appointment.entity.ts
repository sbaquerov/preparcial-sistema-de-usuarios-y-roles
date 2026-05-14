import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type AppointmentStatus = 'pending' | 'cancelled' | 'done';

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'id_user', type: 'uuid' })
  id_user: string;

  @Column({ name: 'id_doctor', type: 'uuid' })
  id_doctor: string;

  @Column({ type: 'timestamp' })
  datetime: Date;

  @Column({ type: 'text' })
  motivo: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'cancelled', 'done'],
    default: 'pending',
  })
  status: AppointmentStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;
}
