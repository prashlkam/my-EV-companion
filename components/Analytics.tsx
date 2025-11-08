import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { LogType, ChargingLog, TripLog, ChargerType, AIRecommendation } from '../types';
import getAIRecommendations from '../services/geminiService';
// Fix: Import `AnalyticsIcon` to resolve reference error.
import { BoltIcon, AnalyticsIcon } from './icons';

const COLORS = ['#00BFFF', '#1E90FF', '#8884d8', '#82ca9d'];

const Analytics: React.FC = () => {
    const { state } = useAppContext();
    const { logs } = state;
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

    const chargingData = useMemo(() => {
        const chargingLogs = logs.filter((log): log is ChargingLog => log.type === LogType.Charging);
        return chargingLogs.map(log => ({
            name: new Date(log.startTime).toLocaleDateString(),
            'Energy Added (kWh)': ((log.endSocPercent - log.startSocPercent) / 100) * (state.evs.find(ev => ev.id === log.evId)?.batteryCapacityKwh || 0),
            'Cost ($)': log.cost || 0,
        }));
    }, [logs, state.evs]);

    const tripData = useMemo(() => {
        const tripLogs = logs.filter((log): log is TripLog => log.type === LogType.Trip);
        return tripLogs.map(log => {
             const distance = log.endOdometer - log.startOdometer;
             return {
                name: new Date(log.startTime).toLocaleDateString(),
                'Distance (mi)': distance,
             };
        });
    }, [logs]);

    const chargerTypeData = useMemo(() => {
        const chargingLogs = logs.filter((log): log is ChargingLog => log.type === LogType.Charging);
        const counts = chargingLogs.reduce((acc, log) => {
            acc[log.chargerType] = (acc[log.chargerType] || 0) + 1;
            return acc;
        }, {} as Record<ChargerType, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [logs]);
    
    const handleGetRecommendations = async () => {
        setLoading(true);
        setRecommendations([]);
        const result = await getAIRecommendations(state);
        setRecommendations(result);
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Analytics</h1>
             {logs.length < 3 ? (
                <div className="text-center py-20 bg-gray-800 rounded-lg">
                    <AnalyticsIcon className="h-16 w-16 mx-auto text-gray-500"/>
                    <h3 className="mt-4 text-xl font-semibold">Not Enough Data</h3>
                    <p className="mt-2 text-gray-400">Log more events to see your analytics.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-5 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Energy Added & Cost</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chargingData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#363636" />
                                <XAxis dataKey="name" stroke="#808080" />
                                <YAxis yAxisId="left" stroke="#808080" />
                                <YAxis yAxisId="right" orientation="right" stroke="#808080" />
                                <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #363636' }} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="Energy Added (kWh)" fill="#00BFFF" />
                                <Bar yAxisId="right" dataKey="Cost ($)" fill="#1E90FF" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-800 p-5 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Charger Type Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={chargerTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                    {chargerTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #363636' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-800 p-5 rounded-lg col-span-1 lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Distance per Trip</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={tripData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#363636" />
                                <XAxis dataKey="name" stroke="#808080" />
                                <YAxis stroke="#808080" />
                                <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #363636' }} />
                                <Legend />
                                <Bar dataKey="Distance (mi)" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
             )}

            <div className="mt-12">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">AI-Powered Recommendations</h2>
                    <p className="text-gray-400 mt-2">Get personalized advice on how to improve your EV's health and efficiency.</p>
                     <button 
                        onClick={handleGetRecommendations}
                        disabled={loading || logs.length < 3}
                        className="mt-6 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center mx-auto disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <BoltIcon className="h-6 w-6 mr-2" />
                        {loading ? 'Analyzing...' : 'Generate Recommendations'}
                    </button>
                    {logs.length < 3 && <p className="text-sm text-yellow-400 mt-2">Log at least 3 events to enable recommendations.</p>}
                </div>

                {loading && (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
                        <p className="mt-4">Gemini is analyzing your data...</p>
                    </div>
                )}
                
                {recommendations.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="bg-gray-800 p-5 rounded-lg border-l-4 border-brand-primary">
                                <h3 className="text-lg font-bold text-white mb-2">{rec.title}</h3>
                                <p className="text-gray-300 mb-3">{rec.recommendation}</p>
                                <p className="text-sm text-gray-500 italic">{rec.rationale}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;