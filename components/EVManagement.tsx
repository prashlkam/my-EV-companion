import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { EV, Log, LogType } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, BoltIcon, CloseIcon, DownloadIcon } from './icons';
import { EVDetail } from './Dashboard';
import { exportDataToExcel } from '../services/exportService';


interface EVFormProps {
    ev?: EV | null;
    onClose: () => void;
}

const EVForm: React.FC<EVFormProps> = ({ ev, onClose }) => {
    const { dispatch } = useAppContext();
    const [formData, setFormData] = useState({
        id: ev?.id || crypto.randomUUID(),
        make: ev?.make || '',
        model: ev?.model || '',
        variant: ev?.variant || '',
        vehicleType: ev?.vehicleType || '4-wheeler',
        year: ev?.year || new Date().getFullYear(),
        batteryCapacityKwh: ev?.batteryCapacityKwh || 0,
        purchaseDate: ev?.purchaseDate || new Date().toISOString().split('T')[0],
        initialOdometer: ev?.initialOdometer || 0,
        initialNotes: ev?.initialNotes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: EV = {
            ...formData,
            images: ev?.images || [],
            videos: ev?.videos || [],
            reviews: ev?.reviews || [],
            socials: ev?.socials || [],
        };
        if (ev) {
            dispatch({ type: 'UPDATE_EV', payload });
        } else {
            dispatch({ type: 'ADD_EV', payload });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{ev ? 'Edit EV' : 'Add New EV'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="make" value={formData.make} onChange={handleChange} placeholder="Make / Brand" required className="bg-gray-700 p-2 rounded w-full" />
                        <input name="model" value={formData.model} onChange={handleChange} placeholder="Model" required className="bg-gray-700 p-2 rounded w-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input name="variant" value={formData.variant} onChange={handleChange} placeholder="Variant / Trim" className="bg-gray-700 p-2 rounded w-full" />
                         <input name="year" type="number" value={formData.year} onChange={handleChange} placeholder="Year" required className="bg-gray-700 p-2 rounded w-full" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Vehicle Type</label>
                        <div className="flex gap-x-6 mt-2">
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="vehicleType" value="4-wheeler" checked={formData.vehicleType === '4-wheeler'} onChange={handleChange} className="form-radio h-4 w-4 text-brand-primary bg-gray-700 border-gray-600 focus:ring-brand-secondary"/>
                                <span className="ml-2 text-gray-300">4 wheeler</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="vehicleType" value="2-wheeler" checked={formData.vehicleType === '2-wheeler'} onChange={handleChange} className="form-radio h-4 w-4 text-brand-primary bg-gray-700 border-gray-600 focus:ring-brand-secondary"/>
                                <span className="ml-2 text-gray-300">2 wheeler</span>
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400">Battery Capacity (kWh)</label>
                            <input name="batteryCapacityKwh" type="number" step="0.1" value={formData.batteryCapacityKwh} onChange={handleChange} placeholder="Battery capacity (kWh)" required className="bg-gray-700 p-2 rounded w-full mt-1" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Odometer at Purchase</label>
                            <input name="initialOdometer" type="number" value={formData.initialOdometer} onChange={handleChange} placeholder="Odo at Purchase" required className="bg-gray-700 p-2 rounded w-full mt-1" />
                        </div>
                    </div>
                    <div>
                         <label className="text-sm text-gray-400">Purchase Date</label>
                         <input name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} required className="bg-gray-700 p-2 rounded w-full mt-1" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">First Notes</label>
                        <textarea name="initialNotes" value={formData.initialNotes} onChange={handleChange} placeholder="Any initial thoughts or observations?" rows={3} className="bg-gray-700 p-2 rounded w-full mt-1"></textarea>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2">Cancel</button>
                        <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded">{ev ? 'Save Changes' : 'Add EV'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface EVManagementProps {
    setCurrentView: (view: string) => void;
    setSelectedEVId: (id: string) => void;
}

const EVManagement: React.FC<EVManagementProps> = ({ setCurrentView, setSelectedEVId }) => {
    const { state, dispatch } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEV, setEditingEV] = useState<EV | null>(null);

    const handleEdit = (ev: EV) => {
        setEditingEV(ev);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this EV and all its logs?")) {
            dispatch({ type: 'DELETE_EV', payload: id });
        }
    };
    
    const getLatestOdometer = (evId: string) => {
        const relevantLogs = state.logs
            .filter(log => log.evId === evId && ('odometer' in log || 'endOdometer' in log));

        if (relevantLogs.length === 0) return null;
            
        const maxOdo = Math.max(...relevantLogs.map(log => {
            if (log.type === LogType.Trip) return log.endOdometer;
            if (log.type === LogType.Service || log.type === LogType.Fault) return log.odometer;
            return 0;
        }));
        
        return maxOdo;
    }

    const handleDownload = () => {
        try {
            exportDataToExcel(state);
        } catch (error) {
            console.error("Failed to export data", error);
            alert("An error occurred while trying to download your data.");
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">My EVs</h1>
                <div className="flex items-center space-x-2">
                    <button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded flex items-center">
                        <DownloadIcon className="h-5 w-5 mr-2" />
                        Download Data
                    </button>
                    <button onClick={() => { setEditingEV(null); setIsFormOpen(true); }} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add EV
                    </button>
                </div>
            </div>
            {state.evs.length === 0 ? (
                 <div className="text-center py-20 bg-gray-800 rounded-lg">
                    <BoltIcon className="h-16 w-16 mx-auto text-gray-500"/>
                    <h3 className="mt-4 text-xl font-semibold">No EVs Added Yet</h3>
                    <p className="mt-2 text-gray-400">Click "Add EV" to get started.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {state.evs.map(ev => (
                        <div key={ev.id} className="bg-gray-800 rounded-lg shadow-lg p-6">
                           <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm text-gray-400">{ev.year} {ev.make}</p>
                                    <h2 className="text-3xl font-bold text-white">{ev.model} {ev.variant && <span className="text-2xl font-medium text-gray-300">{ev.variant}</span>}</h2>
                                    <span className="mt-2 inline-block text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{ev.vehicleType === '2-wheeler' ? '2-Wheeler' : '4-Wheeler'}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(ev)} className="p-2 text-gray-400 hover:text-brand-primary"><PencilIcon className="h-5 w-5" /></button>
                                    <button onClick={() => handleDelete(ev.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            </div>
                             <div className="text-sm text-gray-400 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mb-6">
                                <p><strong>Battery:</strong> {ev.batteryCapacityKwh} kWh</p>
                                <p><strong>Purchased:</strong> {ev.purchaseDate}</p>
                                <p><strong>Odometer:</strong> {getLatestOdometer(ev.id)?.toLocaleString() ?? ev.initialOdometer.toLocaleString()} miles</p>
                            </div>
                            {ev.initialNotes && (
                                <blockquote className="border-l-4 border-gray-600 pl-4 my-4 italic text-gray-400">
                                    {ev.initialNotes}
                                </blockquote>
                            )}
                           
                           <EVDetail ev={ev} setCurrentView={setCurrentView} setSelectedEVId={setSelectedEVId} />
                        </div>
                    ))}
                </div>
            )}
            {isFormOpen && <EVForm ev={editingEV} onClose={() => setIsFormOpen(false)} />}
        </div>
    );
};

export default EVManagement;