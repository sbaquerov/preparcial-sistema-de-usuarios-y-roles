import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me  -> cualquier usuario autenticado
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const pub = this.usersService.toPublic(user);
    return {
      id: pub.id,
      email: pub.email,
      name: pub.name,
      phone: pub.phone,
      roles: pub.roles,
    };
  }

  @Get()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((u) => {
      const pub = this.usersService.toPublic(u);
      return {
        id: pub.id,
        email: pub.email,
        name: pub.name,
        roles: pub.roles,
      };
    });
  }

  @Patch(':id/roles')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async assignRoles(
    @Param('id', new ParseUUIDPipe({ exceptionFactory: () => new NotFoundException('Usuario no encontrado') }))
    id: string,
    @Body() dto: AssignRolesDto,
  ) {
    await this.usersService.assignRoles(id, dto.roles);
    return { message: 'Roles asignados' };
  }
}
