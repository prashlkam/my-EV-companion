
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Log, LogType, ChargerType, FaultType } from '../types';
import { CloseIcon } from './icons';

interface LogModalProps {
  evId: string;
  onClose: () => void;
  logType: LogType;
}

const LogModal: React.FC<LogModalProps> = ({ evId, onClose, logType }) => {
  const { dispatch } = useAppContext();
  const [formData, setFormData] = useState<any>({
    type: logType,
    evId: evId,
    id: crypto.randomUUID(),
    ...(logType === LogType.PurchaseAccessories && {
        purchaseDate: new Date().toISOString().split('T')[0],
        usesPower: false,
        couldVoidWarranty: false
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
                 <div><label className="text-sm">Cost ($)</label><input name="cost" type="number" step="0.01" onChange={handleChange} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
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
                    <div><label>Start Odometer</label><input name="startOdometer" type="number" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label>End Odometer</label><input name="endOdometer" type="number" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                </div>
                <div><label>Purpose</label><input name="purpose" type="text" onChange={handleChange} placeholder="e.g., Commute, Road Trip (Optional)" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
             </>
          );
      case LogType.Service:
          return (
              <>
                  <div><label>Service Date</label><input name="serviceDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  <div><label>Odometer</label><input name="odometer" type="number" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  <div><label>Description</label><textarea name="description" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label>Cost ($)</label><input name="cost" type="number" step="0.01" onChange={handleChange} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
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
                    <div><label className="text-sm">Cost ($)</label><input name="cost" type="number" step="0.01" onChange={handleChange} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label className="text-sm">Weight (lbs)</label><input name="weight" type="number" step="0.1" onChange={handleChange} placeholder="Optional" className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                </div>
                <div>
                    <label className="text-sm">Size (inches)</label>
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
                  <div><label>Odometer</label><input name="odometer" type="number" onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
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
