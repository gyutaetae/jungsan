import { aiReceiptSchema } from "./schemas";

type ExtractReceiptInput = {
  fileName: string;
  mimeType: string;
  base64Image: string;
};

type OpenAiResponseContent = {
  type?: string;
  text?: string;
};

type OpenAiResponseOutput = {
  type?: string;
  content?: OpenAiResponseContent[];
};

type OpenAiResponse = {
  output_text?: string;
  output?: OpenAiResponseOutput[];
};

function getOutputText(response: OpenAiResponse) {
  if (response.output_text) {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === "output_text" && content.text)?.text ??
    ""
  );
}

export async function extractReceipt(input: ExtractReceiptInput) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_RECEIPT_MODEL ?? "gpt-4.1-mini",
      temperature: 0,
      instructions:
        "You extract Korean receipt data into JSON only. Do not infer unknown supplyAmount or vatAmount. If either tax value is unclear, omit it and set vatStatus to missing. Do not recommend expense categories.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Extract this receipt. Return only JSON with transactionDate YYYY-MM-DD, vendorName, optional businessNumber, description, totalAmount, optional supplyAmount, optional vatAmount, vatStatus confirmed|missing, proofType, optional confidence, optional memo.",
            },
            {
              type: "input_image",
              image_url: `data:${input.mimeType};base64,${input.base64Image}`,
              detail: "high",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI 영수증 분석에 실패했습니다. (${response.status}) ${errorText}`,
    );
  }

  const data = (await response.json()) as OpenAiResponse;
  const outputText = getOutputText(data).trim();

  if (!outputText) {
    throw new Error("OpenAI 응답에 추출 결과가 없습니다.");
  }

  const jsonText = outputText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  const parsed = JSON.parse(jsonText) as unknown;

  return aiReceiptSchema.parse(parsed);
}
