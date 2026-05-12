import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const exists = await this.rolesRepository.findOne({
      where: { role_name: dto.role_name },
    });

    if (exists) {
      throw new ConflictException('role_name ya existe');
    }

    const role = this.rolesRepository.create({
      role_name: dto.role_name,
      description: dto.description,
    });

    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    try {
      return await this.rolesRepository.find({
        select: ['id', 'role_name', 'description', 'created_at'],
        order: { created_at: 'ASC' },
      });
    } catch (e) {
      throw new InternalServerErrorException('Error al obtener roles');
    }
  }

  async findByNames(names: string[]): Promise<Role[]> {
    if (!names || names.length === 0) return [];
    return this.rolesRepository.find({
      where: { role_name: In(names) },
    });
  }
}
