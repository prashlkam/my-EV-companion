import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Log, LogType, ChargerType, FaultType, LoanEventType, getUnitsForCountry } from '../types';
import { CloseIcon } from './icons';
import { getLoanSummary, getLoanStatusLabel } from '../services/loanService';

interface LogModalProps {
  evId: string;
  onClose: () => void;
  logType: LogType;
}

const LogModal: React.FC<LogModalProps> = ({ evId, onClose, logType }) => {
  const { state, dispatch } = useAppContext();
  const ev = state.evs.find(e => e.id === evId);
  const units = getUnitsForCountry(ev?.country);
  const loan = getLoanSummary(ev, state.logs);

  // Loan events that reduce/close an existing balance require an active loan.
  const requiresActiveLoan = (eventType: LoanEventType) =>
    eventType === 'emi' || eventType === 'close-loan' || eventType === 'pre-close-loan' || eventType === 'transfer-loan';

  const loanAmountLabel = (eventType?: LoanEventType) => {
    switch (eventType) {
      case 'loan': return 'Loan Amount';
      case 'emi': return 'EMI Amount';
      case 'close-loan': return 'Final Payment Amount';
      case 'pre-close-loan': return 'Settlement Amount';
      case 'transfer-loan': return 'Outstanding Transferred';
      default: return 'Amount';
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<any>({
    type: logType,
    evId: evId,
    id: crypto.randomUUID(),
    ...(logType === LogType.PurchaseAccessories && {
        purchaseDate: today,
        usesPower: false,
        couldVoidWarranty: false
    }),
    // Seed the payment date so loan events sort chronologically even if the
    // user leaves the pre-filled date untouched.
    ...(logType === LogType.LoanEMI && {
        paymentDate: today,
    })
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev: any) => ({ ...prev, [name]: checked }));
        return;
    }

    let val: string | number = value;
    if (type === 'number' || (e.target as HTMLInputElement).type === 'range') {
        val = parseFloat(value) || 0;
    }
    if ((e.target as HTMLInputElement).type === 'datetime-local') {
        val = new Date(value).toISOString();
    }
    setFormData((prev: any) => ({ ...prev, [name]: val }));
  };

  // When the loan event type changes, prefill a sensible default amount.
  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventType = e.target.value as LoanEventType | '';
    setFormData((prev: any) => {
      const next = { ...prev, eventType };
      // Closing, pre-closing or transferring settles the whole outstanding balance.
      if (eventType === 'close-loan' || eventType === 'pre-close-loan' || eventType === 'transfer-loan') {
        next.emiAmount = Number(loan.outstanding.toFixed(2));
      } else if (eventType === 'loan' || eventType === 'emi') {
        next.emiAmount = prev.emiAmount || 0;
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (logType === LogType.LoanEMI) {
      const eventType = formData.eventType as LoanEventType | undefined;
      if (!eventType) {
        alert('Please select a loan event type.');
        return;
      }
      if (eventType === 'loan' && (!formData.emiAmount || formData.emiAmount <= 0)) {
        alert('Please enter the loan amount.');
        return;
      }
      if (requiresActiveLoan(eventType) && loan.outstanding <= 0) {
        alert('There is no active loan balance on this vehicle to record this event against. Record a "Loan" event (or set a loan amount on the EV) first.');
        return;
      }
      if (eventType === 'emi' && formData.emiAmount > loan.outstanding) {
        const proceed = window.confirm(
          `This EMI (${units.currencySymbol}${Number(formData.emiAmount).toFixed(2)}) is larger than the outstanding balance (${units.currencySymbol}${loan.outstanding.toFixed(2)}). The outstanding will be set to 0. Continue?`
        );
        if (!proceed) return;
      }
    }

    dispatch({ type: 'ADD_LOG', payload: formData as Log });
    onClose();
  };
  
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const nowISO = now.toISOString().slice(0, 16);

  const renderFormFields = () => {
    switch (logType) {
      case LogType.Charging:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm">Start Time</label><input name="startTime" type="datetime-local" defaultValue={nowISO} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                <div><label className="text-sm">End Time</label><input name="endTime" type="datetime-local" defaultValue={nowISO} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm">Start SoC (%)</label><input name="startSocPercent" type="number" min="0" max="100" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                <div><label className="text-sm">End SoC (%)</label><input name="endSocPercent" type="number" min="0" max="100" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
            </div>
            <div><label className="text-sm">Charger Type</label><select name="chargerType" onChange={handleChange} defaultValue={ChargerType.L2} required className="bg-gray-700 p-2 rounded w-full mt-1"><option>{ChargerType.L1}</option><option>{ChargerType.L2}</option><option>{ChargerType.DCFC}</option></select></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label className="text-sm">Cost ({units.currencySymbol})</label><input name="cost" type="number" step="0.01" onChange={handleChange} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                 <div><label className="text-sm">Location</label><input name="location" type="text" onChange={handleChange} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
            </div>
          </>
        );
      case LogType.Trip:
          return (
             <>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label>Start Time</label><input name="startTime" type="datetime-local" defaultValue={nowISO} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label>End Time</label><input name="endTime" type="datetime-local" defaultValue={nowISO} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label>Start Odometer ({units.distanceSymbol})</label><input name="startOdometer" type="number" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label>End Odometer ({units.distanceSymbol})</label><input name="endOdometer" type="number" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                </div>
                <div><label>Purpose</label><input name="purpose" type="text" onChange={handleChange} placeholder="e.g., Commute, Road Trip (Optional)" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
             </>
          );
      case LogType.Service:
          return (
              <>
                  <div><label>Service Date</label><input name="serviceDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  <div><label>Odometer ({units.distanceSymbol})</label><input name="odometer" type="number" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  <div><label>Description</label><textarea name="description" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label>Cost ({units.currencySymbol})</label><input name="cost" type="number" step="0.01" onChange={handleChange} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                      <div><label>Performed By</label><input name="performedBy" type="text" onChange={handleChange} placeholder="e.g., Dealer, Self (Optional)" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  </div>
              </>
          );
      case LogType.PurchaseAccessories:
          return (
            <>
                <div><label className="text-sm">Purchase Date</label><input name="purchaseDate" type="date" defaultValue={formData.purchaseDate} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                <div><label className="text-sm">Accessory / Item Name</label><input name="accessoryName" type="text" placeholder="e.g. Roof Rack" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-sm">Brand</label><input name="brand" type="text" onChange={handleChange} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label className="text-sm">Accessory / Item Type</label><input name="accessoryType" type="text" onChange={handleChange} placeholder="e.g., Cargo, Electronics (Optional)" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-sm">Cost ({units.currencySymbol})</label><input name="cost" type="number" step="0.01" onChange={handleChange} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label className="text-sm">Weight ({units.weightSymbol})</label><input name="weight" type="number" step="0.1" onChange={handleChange} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                </div>
                <div>
                    <label className="text-sm">Size ({units.sizeSymbol})</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                        <input name="sizeL" type="number" step="0.1" onChange={handleChange} placeholder="Length" className="bg-gray-700 p-2 rounded w-full" />
                        <input name="sizeW" type="number" step="0.1" onChange={handleChange} placeholder="Width" className="bg-gray-700 p-2 rounded w-full" />
                        <input name="sizeH" type="number" step="0.1" onChange={handleChange} placeholder="Height" className="bg-gray-700 p-2 rounded w-full" />
                    </div>
                </div>
                <div><label className="text-sm">Purpose</label><textarea name="purpose" onChange={handleChange} rows={2} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                <div className="space-y-3 pt-2">
                    <label className="flex items-center cursor-pointer">
                        <input name="usesPower" type="checkbox" checked={!!formData.usesPower} onChange={handleChange} className="form-checkbox h-4 w-4 text-brand-primary bg-gray-700 border-gray-600 focus:ring-brand-secondary"/>
                        <span className="ml-2 text-gray-300">Uses Power</span>
                    </label>
                    {formData.usesPower && (
                        <div className="pl-6"><label className="text-sm">Avg Power Draw (Watts)</label><input name="avgPowerDrawWatts" type="number" onChange={handleChange} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    )}
                    <label className="flex items-center cursor-pointer">
                        <input name="couldVoidWarranty" type="checkbox" checked={!!formData.couldVoidWarranty} onChange={handleChange} className="form-checkbox h-4 w-4 text-brand-primary bg-gray-700 border-gray-600 focus:ring-brand-secondary"/>
                        <span className="ml-2 text-gray-300">Could Void Battery / Vehicle Warranty</span>
                    </label>
                </div>
            </>
          );
      case LogType.Fault:
          return (
              <>
                  <div><label>Fault Date</label><input name="faultDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  <div><label>Odometer ({units.distanceSymbol})</label><input name="odometer" type="number" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  <div><label>Fault Type</label><select name="faultType" onChange={handleChange} defaultValue={FaultType.Other} required className="bg-gray-700 p-2 rounded w-full mt-1"><option>{FaultType.Breakdown}</option><option>{FaultType.Accident}</option><option>{FaultType.WarningLight}</option><option>{FaultType.Other}</option></select></div>
                  <div><label>Description</label><textarea name="description" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  <div><label>Resolution</label><textarea name="resolution" onChange={handleChange} placeholder="How was it fixed? (Optional)" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
              </>
          );
      case LogType.Satisfaction:
          return (
              <>
                  <div><label>Date</label><input name="logDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  <div><label className="block text-sm mb-2">Overall Satisfaction: {formData.rating || 3}/5</label><input name="rating" type="range" min="1" max="5" defaultValue="3" onChange={handleChange} required className="w-full" /></div>
                  <div><label>Comments</label><textarea name="comments" onChange={handleChange} placeholder="Any thoughts? (Optional)" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
              </>
          );
      case LogType.LoanEMI: {
          const eventType = formData.eventType as LoanEventType | '';
          const settlesLoan = eventType === 'close-loan' || eventType === 'pre-close-loan' || eventType === 'transfer-loan';
          return (
              <>
                  <div className="bg-gray-900/50 border border-gray-700 rounded p-3 text-sm">
                      {loan.hasLoan ? (
                          <div className="flex justify-between">
                              <span className="text-gray-400">Current Outstanding</span>
                              <span className={loan.outstanding > 0 ? 'text-yellow-400 font-semibold' : 'text-green-400 font-semibold'}>
                                  {units.currencySymbol}{loan.outstanding.toFixed(2)} {loan.status !== 'active' && `(${getLoanStatusLabel(loan)})`}
                              </span>
                          </div>
                      ) : (
                          <span className="text-gray-400">No active loan yet. Choose "Loan" to record one, or set a Loan Amount on the EV.</span>
                      )}
                  </div>
                  <div><label>Event Type</label><select name="eventType" value={eventType} onChange={handleEventTypeChange} required className="bg-gray-700 p-2 rounded w-full mt-1"><option value="">Select event type</option><option value="loan">Loan (take / add a loan)</option><option value="emi">EMI (payment)</option><option value="close-loan">Close Loan</option><option value="pre-close-loan">Pre-close Loan</option><option value="transfer-loan">Transfer Loan</option></select></div>
                  <div><label>{eventType === 'emi' ? 'Payment Date' : 'Date'}</label><input name="paymentDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  <div>
                      <label>{loanAmountLabel(eventType || undefined)} ({units.currencySymbol})</label>
                      <input name="emiAmount" type="number" step="0.01" value={formData.emiAmount ?? ''} onChange={handleChange} required={!settlesLoan} className="bg-gray-700 p-2 rounded w-full mt-1" />
                      {settlesLoan && <p className="text-xs text-gray-400 mt-1">This will set the outstanding balance to {units.currencySymbol}0.00.</p>}
                  </div>
                  {eventType === 'emi' && (
                      <div><label>EMI Number (Optional)</label><input name="emiNumber" type="number" onChange={handleChange} placeholder="e.g., 1, 2, 3..." className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  )}
                  {eventType === 'transfer-loan' && (
                      <div><label>Transferred To (Optional)</label><input name="transferredTo" type="text" onChange={handleChange} placeholder="New lender or owner" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  )}
              </>
          );
      }
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Log {logType} Event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormFields()}
          <textarea name="notes" onChange={handleChange} placeholder="Notes (Optional)" className="bg-gray-700 p-2 rounded w-full mt-1" />
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2">Cancel</button>
            <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded">Add Log</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogModal;
