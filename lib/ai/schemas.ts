import { z } from "zod";
import type { LedgerEntry } from "../../types/ledger";

export const aiReceiptSchema = z
  .object({
    transactionDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .catch(""),
    vendorName: z.string().trim().min(1).catch("확인 필요"),
    businessNumber: z.string().trim().optional(),
    description: z.string().trim().min(1).catch("영수증"),
    totalAmount: z.number().int().nonnegative(),
    supplyAmount: z.number().int().nonnegative().optional(),
    vatAmount: z.number().int().nonnegative().optional(),
    vatStatus: z.enum(["confirmed", "missing"]).catch("missing"),
    proofType: z
      .enum(["카드영수증", "현금영수증", "세금계산서", "간이영수증", "기타"])
      .catch("기타"),
    confidence: z.number().min(0).max(1).optional(),
    memo: z.string().trim().optional(),
  })
  .transform((value) => {
    const hasTaxValues =
      value.supplyAmount !== undefined || value.vatAmount !== undefined;

    return {
      ...value,
      vatStatus: hasTaxValues ? value.vatStatus : "missing",
      category: "기타경비",
      status: "needs_review",
      source: "receipt",
    } satisfies Omit<LedgerEntry, "id" | "createdAt" | "originalFileName">;
  });

export type AiReceipt = z.infer<typeof aiReceiptSchema>;
