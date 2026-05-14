import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppointmentsMigration1715000001000 implements MigrationInterface {
  name = 'AppointmentsMigration1715000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "appointments_status_enum" AS ENUM ('pending', 'cancelled', 'done')`,
    );

    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "id_user" uuid NOT NULL,
        "id_doctor" uuid NOT NULL,
        "datetime" TIMESTAMP NOT NULL,
        "motivo" text NOT NULL,
        "status" "appointments_status_enum" NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_appointments_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_appointments_id_user" ON "appointments" ("id_user")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_appointments_id_doctor" ON "appointments" ("id_doctor")`,
    );

    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD CONSTRAINT "FK_appointments_id_user"
      FOREIGN KEY ("id_user") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD CONSTRAINT "FK_appointments_id_doctor"
      FOREIGN KEY ("id_doctor") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_id_doctor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_id_user"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_appointments_id_doctor"`);
    await queryRunner.query(`DROP INDEX "IDX_appointments_id_user"`);
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TYPE "appointments_status_enum"`);
  }
}
