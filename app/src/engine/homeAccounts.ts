// The home's accounts and their total (2026-10-30, direct feedback: the total is the sum of the accounts shown; 2026-10-31:
// two accounts again, Money and Investments). Authored demo figures, passed in by the home, like every balance here.
export interface HomeAccounts {
  money: number;
  investments: number;
  /** Everything the user owns, in dollars. Loans, when there are any, are never added in. */
  total: number;
}

const cents = (value: number) => Math.round(value * 100);

export function homeAccounts(money: number, investments: number): HomeAccounts {
  return { money, investments, total: (cents(money) + cents(investments)) / 100 };
}
