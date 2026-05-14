import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('patient')
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() dto: CreateAppointmentDto) {
    const cita = await this.appointmentsService.create(req.user.userId, dto);
    return {
      message: 'Cita creada con éxito',
      appointmentId: cita.id,
    };
  }

  @Get()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return this.appointmentsService.findAllAdmin();
  }

  @Get('me')
  @Roles('patient')
  @HttpCode(HttpStatus.OK)
  async findMine(@Req() req: any) {
    return this.appointmentsService.findMine(req.user.userId);
  }

  @Get('schedule')
  @Roles('doctor')
  @HttpCode(HttpStatus.OK)
  async findSchedule(@Req() req: any) {
    return this.appointmentsService.findDoctorSchedule(req.user.userId);
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'patient')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new NotFoundException('Cita no encontrada'),
      }),
    )
    id: string,
    @Req() req: any,
  ) {
    return this.appointmentsService.findOne(id, req.user.userId, req.user.roles);
  }

  @Patch(':id/status')
  @Roles('doctor')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new NotFoundException('Cita no encontrada'),
      }),
    )
    id: string,
    @Req() req: any,
    @Body() dto: UpdateStatusDto,
  ) {
    const cita = await this.appointmentsService.updateStatus(
      id,
      req.user.userId,
      dto,
    );
    return {
      message: 'Estado actualizado con éxito',
      status: cita.status,
    };
  }

  @Delete(':id')
  @Roles('patient')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new NotFoundException('Cita no encontrada'),
      }),
    )
    id: string,
    @Req() req: any,
  ) {
    await this.appointmentsService.remove(id, req.user.userId);
  }
}
