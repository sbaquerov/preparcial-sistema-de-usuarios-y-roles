import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @IsNotEmpty({ message: 'status es requerido' })
  @IsIn(['done', 'cancelled'], {
    message: 'status solo puede ser done o cancelled',
  })
  status: 'done' | 'cancelled';
}
