import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRoleDto) {
    const role = await this.rolesService.create(dto);
    return {
      message: 'Rol creado con éxito',
      roleId: role.id,
    };
  }

  @Get()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const roles = await this.rolesService.findAll();
    return roles.map((r) => ({
      id: r.id,
      role_name: r.role_name,
      description: r.description,
    }));
  }
}
