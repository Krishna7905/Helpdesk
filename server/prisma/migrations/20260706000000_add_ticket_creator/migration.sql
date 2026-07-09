-- Add creator ownership for manually created tickets
ALTER TABLE "ticket"
ADD COLUMN "createdById" TEXT;

ALTER TABLE "ticket"
ADD CONSTRAINT "ticket_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "user"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
