import { EV, Log, LogType, LoanEMILog, LoanEventType, getUnitsForCountry } from '../types';

export type LoanStatus = 'none' | 'active' | 'closed' | 'transferred';

export interface LoanSummary {
  /** Whether the EV has any loan associated (initial loan amount or a logged loan event). */
  hasLoan: boolean;
  /** Total principal ever disbursed (initial loan amount + any additional 'loan' events). */
  totalPrincipal: number;
  /** Total of all EMI payments recorded. */
  totalPaid: number;
  /** Current outstanding balance on the EV's loan. */
  outstanding: number;
  /** Current state of the loan. */
  status: LoanStatus;
  /** The transferee, when the loan was last transferred out. */
  transferredTo?: string;
}

/** Returns the LoanEMI logs for an EV, sorted chronologically by payment date (stable). */
export const getLoanEventsForEV = (evId: string, logs: Log[]): LoanEMILog[] => {
  return logs
    .map((log, index) => ({ log, index }))
    .filter(({ log }) => log.evId === evId && log.type === LogType.LoanEMI)
    .sort((a, b) => {
      const dateA = new Date((a.log as LoanEMILog).paymentDate).getTime();
      const dateB = new Date((b.log as LoanEMILog).paymentDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      // Stable tie-break: preserve the order the events were logged in.
      return a.index - b.index;
    })
    .map(({ log }) => log as LoanEMILog);
};

/**
 * Computes the loan summary for an EV by replaying its loan events in
 * chronological order. Each event type affects the outstanding balance:
 *   - loan:            adds the disbursed principal (initial or a top-up)
 *   - emi:             reduces the outstanding by the amount paid
 *   - close-loan:      loan fully closed  -> outstanding becomes 0
 *   - pre-close-loan:  early settlement   -> outstanding becomes 0
 *   - transfer-loan:   transferred out    -> outstanding becomes 0 on this EV
 */
export const getLoanSummary = (ev: EV | undefined, logs: Log[]): LoanSummary => {
  const empty: LoanSummary = {
    hasLoan: false,
    totalPrincipal: 0,
    totalPaid: 0,
    outstanding: 0,
    status: 'none',
  };
  if (!ev) return empty;

  const events = getLoanEventsForEV(ev.id, logs);
  const initialPrincipal = ev.loanAmount || 0;

  if (initialPrincipal <= 0 && events.length === 0) {
    return empty;
  }

  let outstanding = initialPrincipal;
  let totalPrincipal = initialPrincipal;
  let totalPaid = 0;
  let status: LoanStatus = initialPrincipal > 0 ? 'active' : 'none';
  let transferredTo: string | undefined;

  for (const event of events) {
    const amount = event.emiAmount || 0;
    switch (event.eventType) {
      case 'loan':
        outstanding += amount;
        totalPrincipal += amount;
        status = 'active';
        transferredTo = undefined;
        break;
      case 'emi':
        outstanding = Math.max(0, outstanding - amount);
        totalPaid += amount;
        status = outstanding > 0 ? 'active' : 'closed';
        break;
      case 'close-loan':
      case 'pre-close-loan':
        totalPaid += amount;
        outstanding = 0;
        status = 'closed';
        break;
      case 'transfer-loan':
        outstanding = 0;
        status = 'transferred';
        transferredTo = event.transferredTo;
        break;
    }
  }

  outstanding = Math.max(0, outstanding);

  return {
    hasLoan: true,
    totalPrincipal,
    totalPaid,
    outstanding,
    status,
    transferredTo,
  };
};

/** Convenience helper: current outstanding balance for an EV. */
export const getOutstandingLoan = (ev: EV | undefined, logs: Log[]): number => {
  return getLoanSummary(ev, logs).outstanding;
};

/** Human-readable label for a loan status. */
export const getLoanStatusLabel = (summary: LoanSummary): string => {
  switch (summary.status) {
    case 'active':
      return 'Active';
    case 'closed':
      return 'Closed';
    case 'transferred':
      return summary.transferredTo ? `Transferred to ${summary.transferredTo}` : 'Transferred';
    default:
      return '';
  }
};

/** Formats a currency amount using the EV's country units. */
export const formatLoanCurrency = (amount: number, countryCode?: string): string => {
  const units = getUnitsForCountry(countryCode);
  return `${units.currencySymbol}${amount.toFixed(2)}`;
};

/** Human-readable label for a loan event type (used in logs/exports). */
export const getLoanEventLabel = (eventType: LoanEventType): string => {
  switch (eventType) {
    case 'loan':
      return 'Loan Taken';
    case 'emi':
      return 'EMI Payment';
    case 'close-loan':
      return 'Loan Closed';
    case 'pre-close-loan':
      return 'Loan Pre-closed';
    case 'transfer-loan':
      return 'Loan Transferred';
    default:
      return 'Loan / EMI';
  }
};
