-- CreateTable
CREATE TABLE "Exploit" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "protocol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fundsLost" BIGINT NOT NULL,
    "txIds" TEXT[],
    "description" TEXT NOT NULL,
    "codeSnippet" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exploit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "txIds" TEXT[],
    "evidenceUrl" TEXT,
    "submitter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveAlert" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "protocol" TEXT NOT NULL,
    "estimatedLoss" BIGINT NOT NULL,
    "txIds" TEXT[],
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exploit_date_idx" ON "Exploit"("date");

-- CreateIndex
CREATE INDEX "Exploit_protocol_idx" ON "Exploit"("protocol");

-- CreateIndex
CREATE INDEX "Analytics_metricType_idx" ON "Analytics"("metricType");

-- CreateIndex
CREATE INDEX "Resource_category_idx" ON "Resource"("category");
