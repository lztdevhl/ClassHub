CREATE TYPE "ClassStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE "ClassGroup" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "status" "ClassStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClassGroup_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Student" ADD COLUMN "classId" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "classId" TEXT;

CREATE UNIQUE INDEX "ClassGroup_name_key" ON "ClassGroup"("name");
CREATE INDEX "ClassGroup_status_name_idx" ON "ClassGroup"("status", "name");
CREATE INDEX "Student_classId_status_name_idx" ON "Student"("classId", "status", "name");
CREATE INDEX "Lesson_classId_lessonDate_idx" ON "Lesson"("classId", "lessonDate");

ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
