import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { RolesService } from '../roles/roles.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  async create(dto: RegisterDto): Promise<User> {
    const exists = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('Email ya registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      phone: dto.phone,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
    });

    // Si se asignan roles en el registro
    if (dto.roles && dto.roles.length > 0) {
      const roles = await this.rolesService.findByNames(dto.roles);
      if (roles.length !== dto.roles.length) {
        throw new BadRequestException('roles inválidos');
      }
      user.roles = roles;
    } else {
      user.roles = [];
    }

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.usersRepository.find({
        order: { created_at: 'ASC' },
      });
    } catch (e) {
      throw new InternalServerErrorException('Error al listar usuarios');
    }
  }

  async assignRoles(userId: string, roleNames: string[]): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const roles = await this.rolesService.findByNames(roleNames);
    if (roles.length !== roleNames.length) {
      throw new BadRequestException('roles inválidos');
    }

    user.roles = roles;
    return this.usersRepository.save(user);
  }

  toPublic(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      is_active: user.is_active,
      roles: (user.roles || []).map((r) => ({
        id: r.id,
        role_name: r.role_name,
        description: r.description,
      })),
    };
  }
}
