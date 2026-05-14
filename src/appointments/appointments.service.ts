import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    private readonly usersService: UsersService,
  ) {}

  async create(patientId: string, dto: CreateAppointmentDto): Promise<Appointment> {
    const doctor = await this.usersService.findById(dto.id_doctor);
    if (!doctor) {
      throw new NotFoundException('Doctor no encontrado');
    }

    const doctorRoles = (doctor.roles || []).map((r) => r.role_name);
    if (!doctorRoles.includes('doctor')) {
      throw new BadRequestException('El usuario indicado no es un doctor');
    }

    const fecha = new Date(dto.datetime);
    if (fecha.getTime() < Date.now()) {
      throw new BadRequestException('La fecha de la cita debe ser futura');
    }

    const cita = this.appointmentsRepository.create({
      id_user: patientId,
      id_doctor: dto.id_doctor,
      datetime: fecha,
      motivo: dto.motivo,
      status: 'pending',
    });

    return this.appointmentsRepository.save(cita);
  }

  async findAllAdmin(): Promise<Appointment[]> {
    try {
      return await this.appointmentsRepository.find({
        order: { created_at: 'ASC' },
      });
    } catch (e) {
      throw new InternalServerErrorException('Error al listar citas');
    }
  }

  async findMine(patientId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { id_user: patientId },
      order: { datetime: 'ASC' },
    });
  }

  async findDoctorSchedule(doctorId: string): Promise<Appointment[]> {
    const propias = await this.appointmentsRepository.find({
      where: { id_doctor: doctorId },
    });

    const pacienteIds = Array.from(new Set(propias.map((c) => c.id_user)));

    if (pacienteIds.length === 0) {
      return propias;
    }

    return this.appointmentsRepository.find({
      where: [
        { id_doctor: doctorId },
        { id_user: In(pacienteIds) },
      ],
      order: { datetime: 'ASC' },
    });
  }

  async findOne(id: string, userId: string, roles: string[]): Promise<Appointment> {
    const cita = await this.appointmentsRepository.findOne({ where: { id } });
    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (roles.includes('admin')) return cita;
    if (roles.includes('doctor') && cita.id_doctor === userId) return cita;
    if (cita.id_user === userId) return cita;

    throw new ForbiddenException('No autorizado');
  }

  async updateStatus(
    id: string,
    doctorId: string,
    dto: UpdateStatusDto,
  ): Promise<Appointment> {
    const cita = await this.appointmentsRepository.findOne({ where: { id } });
    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (cita.id_doctor !== doctorId) {
      throw new ForbiddenException('No autorizado');
    }

    if (cita.status !== 'pending') {
      throw new BadRequestException(
        'Solo se puede cambiar el estado de citas pendientes',
      );
    }

    cita.status = dto.status;
    return this.appointmentsRepository.save(cita);
  }

  async remove(id: string, patientId: string): Promise<void> {
    const cita = await this.appointmentsRepository.findOne({ where: { id } });
    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (cita.id_user !== patientId) {
      throw new ForbiddenException('No autorizado');
    }

    await this.appointmentsRepository.remove(cita);
  }
}
