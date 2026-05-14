import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID('4', { message: 'id_doctor inválido' })
  @IsNotEmpty({ message: 'id_doctor es requerido' })
  id_doctor: string;

  @IsDateString({}, { message: 'datetime debe ser una fecha válida' })
  @IsNotEmpty({ message: 'datetime es requerido' })
  datetime: string;

  @IsString()
  @IsNotEmpty({ message: 'motivo es requerido' })
  @MinLength(3, { message: 'el motivo debe tener al menos 3 caracteres' })
  motivo: string;
}
