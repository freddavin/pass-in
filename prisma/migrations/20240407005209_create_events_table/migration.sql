-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "details" TEXT,
    "max_attendees" INTEGER,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);
