# ADR: Technical Decisions

## 1. AI Extracts, Template Engine Writes

Decision: AI only extracts structured JSON from receipts. It never generates the final Excel document.

Reason: The product's core promise is preserving a known accounting form. Template-based writing is more reliable than asking AI to format documents.

## 2. Start With 간편장부 Excel

Decision: The first official output is a simplified bookkeeping Excel based on 국세청 간편장부.

Reason: It is useful to freelancers/small businesses, easy to demo, and closer to actual tax prep than a generic expense list.

## 3. No HomeTax Auto Submission

Decision: HomeTax login, certificate handling, and automatic tax filing are out of MVP scope.

Reason: They create policy, authentication, and reliability risks. The MVP should say "신고 준비 자동화", not "자동 신고".

## 4. No Server Database

Decision: Do not use a server database or accounts.

Reason: The demo should be fast to build, low-risk, and privacy-friendly. Uploaded files are processed transiently and not stored.

## 5. One Screen, Review Table First

Decision: Use a single-screen app where all inputs flow into one review table.

Reason: Users are more likely to trust AI when they can inspect and edit the result. The table is the trust surface.

## 6. Unknown Tax Values Stay Unknown

Decision: If supply amount or VAT is unclear, mark it as missing instead of estimating.

Reason: Explicit uncertainty improves trust. Incorrect tax inference is worse than a visible "미확인" state.

## 7. No Category Recommendation in MVP

Decision: Default category is `기타경비`; users choose from a dropdown.

Reason: Account classification is context-dependent. Wrong recommendations can reduce trust and distract from the demo.

## 8. Demo Fallbacks Are Product Requirements

Decision: Include sample data and sample extraction fallback.

Reason: This is an idea-thon demo. Network/API failures should not stop the core story.

## 9. Official Template First, MVP Template Fallback

Decision: Try to use the official 국세청 간편장부 Excel template. If blocked, generate an MVP template with the same core fields.

Reason: Official form fidelity matters, but implementation must not stall on external file access or template complexity.

## 10. Visual Tone

Decision: Use lime green as the single accent color, with mostly neutral UI.

Reason: The service should feel approachable and unlike HomeTax, while still credible for tax preparation.

## 11. Official HWP Files Are References Only

Decision: Store the official HWP files under `templates/official/`, but do not parse, convert, or edit them at runtime.

Reason: HWP editing in a Vercel/Node MVP adds format and deployment risk. Keeping the official files as references preserves the form baseline without making HWP processing part of the product surface.

## 12. Generate Tax Prep XLSX Drafts

Decision: Generate 신고 준비 문서 as `jeongsan-tax-prep-draft.xlsx` 검토용 초안, not as HWP output.

Reason: The existing app already uses `exceljs`, and xlsx is easier for users to inspect before entering values in HomeTax. The product should clearly say 홈택스 입력 전 확인 필요 and avoid implying the draft can be filed as-is.

## 13. User Enters Total Income

Decision: Ask the user to enter `totalIncomeAmount` directly.

Reason: The current inputs mainly capture expenses from receipts and transaction files. Inferring income from expense-side data would be unreliable and could create a false sense of tax accuracy.
