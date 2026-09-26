export interface Expense {
  id: number;
  date: string;
  description: string;
  amount: number | string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInput {
  date: string;
  description: string;
  amount: number;
}
