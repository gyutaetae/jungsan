import { aiReceiptSchema } from "./schemas";

type ExtractReceiptInput = {
  fileName: string;
  mimeType: string;
  base64Image: string;
};

type AiReceiptProvider = "anthropic" | "openai" | "auto";

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

type AnthropicTextContent = {
  type?: string;
  text?: string;
};

type AnthropicResponse = {
  content?: AnthropicTextContent[];
};

const receiptPrompt =
  "Extract this Korean receipt. Return only JSON with transactionDate YYYY-MM-DD, vendorName, optional businessNumber, description, totalAmount, optional supplyAmount, optional vatAmount, vatStatus confirmed|missing, proofType, optional confidence, optional memo.";

const receiptSystemPrompt =
  "You extract Korean receipt data into JSON only. Do not infer unknown supplyAmount or vatAmount. If either tax value is unclear, omit it and set vatStatus to missing. Do not recommend expense categories.";

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

function getAnthropicOutputText(response: AnthropicResponse) {
  return (
    response.content?.find((content) => content.type === "text" && content.text)
      ?.text ?? ""
  );
}

function parseReceiptJson(outputText: string, providerName: string) {
  if (!outputText) {
    throw new Error(`${providerName} 응답에 추출 결과가 없습니다.`);
  }

  const jsonText = outputText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  const parsed = JSON.parse(jsonText) as unknown;

  return aiReceiptSchema.parse(parsed);
}

async function extractWithOpenAi(input: ExtractReceiptInput) {
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
      instructions: receiptSystemPrompt,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: receiptPrompt,
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
  return parseReceiptJson(getOutputText(data), "OpenAI");
}

async function extractWithAnthropic(input: ExtractReceiptInput) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY가 설정되지 않았습니다.");
  }

  const supportedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ]);

  if (!supportedMimeTypes.has(input.mimeType)) {
    throw new Error(
      `Claude가 지원하지 않는 이미지 형식입니다. (${input.mimeType}) JPEG, PNG, GIF, WEBP를 사용해주세요.`,
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_RECEIPT_MODEL ?? "claude-sonnet-4-6",
      max_tokens: 1024,
      temperature: 0,
      system: receiptSystemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: input.mimeType,
                data: input.base64Image,
              },
            },
            {
              type: "text",
              text: receiptPrompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Claude 영수증 분석에 실패했습니다. (${response.status}) ${errorText}`,
    );
  }

  const data = (await response.json()) as AnthropicResponse;
  return parseReceiptJson(getAnthropicOutputText(data), "Claude");
}

function getReceiptProvider(): AiReceiptProvider {
  const provider = process.env.AI_RECEIPT_PROVIDER;

  if (provider === "anthropic" || provider === "openai" || provider === "auto") {
    return provider;
  }

  return "auto";
}

export async function extractReceipt(input: ExtractReceiptInput) {
  const provider = getReceiptProvider();

  if (provider === "anthropic") {
    return extractWithAnthropic(input);
  }

  if (provider === "openai") {
    return extractWithOpenAi(input);
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return extractWithAnthropic(input);
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY 또는 OPENAI_API_KEY가 설정되지 않았습니다.",
    );
  }

  return extractWithOpenAi(input);
}
