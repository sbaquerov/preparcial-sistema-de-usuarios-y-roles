import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1715000000000 implements MigrationInterface {
  name = 'InitialMigration1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extensión necesaria para uuid_generate_v4
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Tabla users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL,
        "password" varchar NOT NULL,
        "name" varchar,
        "phone" varchar,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Tabla roles
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "role_name" varchar NOT NULL,
        "description" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_role_name" UNIQUE ("role_name"),
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
      )
    `);

    // Tabla pivote users_roles (many-to-many)
    await queryRunner.query(`
      CREATE TABLE "users_roles" (
        "user_id" uuid NOT NULL,
        "role_id" uuid NOT NULL,
        CONSTRAINT "PK_users_roles" PRIMARY KEY ("user_id", "role_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_roles_user_id" ON "users_roles" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_users_roles_role_id" ON "users_roles" ("role_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "users_roles"
      ADD CONSTRAINT "FK_users_roles_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "users_roles"
      ADD CONSTRAINT "FK_users_roles_role_id"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_roles" DROP CONSTRAINT "FK_users_roles_role_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_roles" DROP CONSTRAINT "FK_users_roles_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_users_roles_role_id"`);
    await queryRunner.query(`DROP INDEX "IDX_users_roles_user_id"`);
    await queryRunner.query(`DROP TABLE "users_roles"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
