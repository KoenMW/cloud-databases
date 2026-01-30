export type ProcessedMortgage = {
  id: number;
  FullName: string;
  Email: string;
  Address: string;
  processed_at: Date;
  AnnualIncome: number;
  LoanAmount: number;
  LoanTermYears: number;
  accepted: boolean;
  notifications_sent: boolean;
};

export type EmailList = {
  id: number;
  full_name: string;
  email: string;
  accepted: boolean;
  loan_amount: number;
};
