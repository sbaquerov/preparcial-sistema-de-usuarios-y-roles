import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignRolesDto {
  @IsArray({ message: 'roles inválidos' })
  @ArrayNotEmpty({ message: 'roles inválidos' })
  @IsString({ each: true, message: 'roles inválidos' })
  roles: string[];
}
