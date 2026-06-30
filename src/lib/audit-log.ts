import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";

export async function logAudit(input: {
  userId?: string | null;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  detail?: string;
}) {
  await prisma.auditLog.create({
    data: {
      id: createId(),
      userId: input.userId ?? null,
      userName: input.userName,
      userRole: input.userRole,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId ?? null,
      detail: input.detail ?? "",
      createdAt: new Date().toISOString(),
    },
  });
}

export async function listAuditLogs(limit = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
