export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          business_name: string;
          business_number: string | null;
          tax_year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          business_name: string;
          business_number?: string | null;
          tax_year: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          business_name?: string;
          business_number?: string | null;
          tax_year?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      import_batches: {
        Row: {
          id: string;
          business_id: string;
          source_type: Database["public"]["Enums"]["import_source_type"];
          status: Database["public"]["Enums"]["import_status"];
          item_count: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          source_type: Database["public"]["Enums"]["import_source_type"];
          status?: Database["public"]["Enums"]["import_status"];
          item_count?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          business_id?: string;
          source_type?: Database["public"]["Enums"]["import_source_type"];
          status?: Database["public"]["Enums"]["import_status"];
          item_count?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      ledger_entries: {
        Row: {
          id: string;
          business_id: string;
          batch_id: string | null;
          source_file_id: string | null;
          source: Database["public"]["Enums"]["ledger_source"];
          status: Database["public"]["Enums"]["ledger_status"];
          transaction_date: string;
          vendor_name: string;
          business_number: string | null;
          description: string;
          total_amount: number;
          supply_amount: number | null;
          vat_amount: number | null;
          vat_status: Database["public"]["Enums"]["vat_status"];
          category: Database["public"]["Enums"]["expense_category"];
          proof_type: Database["public"]["Enums"]["proof_type"];
          confidence: number | null;
          memo: string | null;
          original_file_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          batch_id?: string | null;
          source_file_id?: string | null;
          source: Database["public"]["Enums"]["ledger_source"];
          status?: Database["public"]["Enums"]["ledger_status"];
          transaction_date: string;
          vendor_name: string;
          business_number?: string | null;
          description?: string;
          total_amount: number;
          supply_amount?: number | null;
          vat_amount?: number | null;
          vat_status?: Database["public"]["Enums"]["vat_status"];
          category?: Database["public"]["Enums"]["expense_category"];
          proof_type?: Database["public"]["Enums"]["proof_type"];
          confidence?: number | null;
          memo?: string | null;
          original_file_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          batch_id?: string | null;
          source_file_id?: string | null;
          source?: Database["public"]["Enums"]["ledger_source"];
          status?: Database["public"]["Enums"]["ledger_status"];
          transaction_date?: string;
          vendor_name?: string;
          business_number?: string | null;
          description?: string;
          total_amount?: number;
          supply_amount?: number | null;
          vat_amount?: number | null;
          vat_status?: Database["public"]["Enums"]["vat_status"];
          category?: Database["public"]["Enums"]["expense_category"];
          proof_type?: Database["public"]["Enums"]["proof_type"];
          confidence?: number | null;
          memo?: string | null;
          original_file_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      source_files: {
        Row: {
          id: string;
          batch_id: string;
          original_file_name: string;
          storage_path: string | null;
          mime_type: string | null;
          status: Database["public"]["Enums"]["import_status"];
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          original_file_name: string;
          storage_path?: string | null;
          mime_type?: string | null;
          status?: Database["public"]["Enums"]["import_status"];
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          original_file_name?: string;
          storage_path?: string | null;
          mime_type?: string | null;
          status?: Database["public"]["Enums"]["import_status"];
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tax_prep_summaries: {
        Row: {
          id: string;
          business_id: string;
          tax_year: number;
          total_income_amount: number;
          total_expense_amount: number;
          estimated_income_amount: number;
          supply_amount: number;
          vat_amount: number;
          needs_review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          tax_year: number;
          total_income_amount?: number;
          total_expense_amount?: number;
          supply_amount?: number;
          vat_amount?: number;
          needs_review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          tax_year?: number;
          total_income_amount?: number;
          total_expense_amount?: number;
          supply_amount?: number;
          vat_amount?: number;
          needs_review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      category_expense_summary: {
        Row: {
          business_id: string | null;
          category: Database["public"]["Enums"]["expense_category"] | null;
          entry_count: number | null;
          total_amount: number | null;
        };
      };
      monthly_expense_summary: {
        Row: {
          business_id: string | null;
          month: string | null;
          entry_count: number | null;
          total_amount: number | null;
          supply_amount: number | null;
          vat_amount: number | null;
        };
      };
      needs_review_entries: {
        Row: Database["public"]["Tables"]["ledger_entries"]["Row"];
      };
      proof_type_expense_summary: {
        Row: {
          business_id: string | null;
          proof_type: Database["public"]["Enums"]["proof_type"] | null;
          entry_count: number | null;
          total_amount: number | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      expense_category:
        | "소모품비"
        | "여비교통비"
        | "접대비"
        | "통신비"
        | "지급수수료"
        | "광고선전비"
        | "차량유지비"
        | "기타경비";
      import_source_type: "receipt" | "spreadsheet" | "camera" | "sample";
      import_status: "pending" | "processing" | "done" | "failed";
      ledger_source: "receipt" | "spreadsheet" | "camera" | "sample";
      ledger_status:
        | "queued"
        | "processing"
        | "needs_review"
        | "confirmed"
        | "failed";
      proof_type:
        | "카드영수증"
        | "현금영수증"
        | "세금계산서"
        | "간이영수증"
        | "기타";
      vat_status: "confirmed" | "missing" | "estimated";
    };
  };
};
