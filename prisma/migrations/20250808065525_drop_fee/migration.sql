/*
  Warnings:

  - You are about to drop the column `fee` on the `opportunities` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_opportunities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "link" TEXT,
    "eligibility" TEXT NOT NULL,
    "artTypes" TEXT,
    "prize" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_opportunities" ("artTypes", "createdAt", "deadline", "description", "eligibility", "id", "link", "location", "organizer", "prize", "title", "type", "updatedAt") SELECT "artTypes", "createdAt", "deadline", "description", "eligibility", "id", "link", "location", "organizer", "prize", "title", "type", "updatedAt" FROM "opportunities";
DROP TABLE "opportunities";
ALTER TABLE "new_opportunities" RENAME TO "opportunities";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
