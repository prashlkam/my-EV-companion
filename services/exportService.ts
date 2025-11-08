import 'xlsx'; // Import for side effects, which attaches XLSX to the window object
import { AppState, Log, EV, LogType, TripLog, ChargingLog, ServiceLog, ChargerType } from '../types';

const getLogDateString = (log: Log): string => {
    if ('startTime' in log) return log.startTime;
    if ('serviceDate' in log) return log.serviceDate;
    if ('faultDate' in log) return log.faultDate;
    if ('purchaseDate' in log) return log.purchaseDate;
    if ('logDate' in log) return log.logDate;
    return '';
};

// Maps each log type to a flat object with all possible fields
const formatLogsForExport = (logs: Log[]) => {
    return logs.map(log => {
        const base = {
            'Log ID': log.id,
            'EV ID': log.evId,
            'Log Type': log.type,
            'Date': getLogDateString(log) ? new Date(getLogDateString(log)).toLocaleString() : '',
            // Fix: Safely access the 'notes' property, as it doesn't exist on all Log types (e.g., SatisfactionLog).
            'Notes': 'notes' in log ? log.notes || '' : '',
        };

        switch (log.type) {
            case LogType.Charging:
                return {
                    ...base,
                    'Start Time': new Date(log.startTime).toLocaleString(),
                    'End Time': new Date(log.endTime).toLocaleString(),
                    'Start SoC (%)': log.startSocPercent,
                    'End SoC (%)': log.endSocPercent,
                    'Charger Type': log.chargerType,
                    'Cost ($)': log.cost,
                    'Location': log.location,
                };
            case LogType.Trip:
                return {
                    ...base,
                    'Start Time': new Date(log.startTime).toLocaleString(),
                    'End Time': new Date(log.endTime).toLocaleString(),
                    'Start Odometer': log.startOdometer,
                    'End Odometer': log.endOdometer,
                    'Distance (mi)': log.endOdometer - log.startOdometer,
                    'Purpose': log.purpose,
                };
            case LogType.Service:
                return {
                    ...base,
                    'Odometer': log.odometer,
                    'Description': log.description,
                    'Cost ($)': log.cost,
                    'Performed By': log.performedBy,
                };
            case LogType.PurchaseAccessories:
                 return {
                    ...base,
                    'Accessory Name': log.accessoryName,
                    'Brand': log.brand,
                    'Accessory Type': log.accessoryType,
                    'Cost ($)': log.cost,
                    'Size L (in)': log.sizeL,
                    'Size W (in)': log.sizeW,
                    'Size H (in)': log.sizeH,
                    'Weight (lbs)': log.weight,
                    'Purpose': log.purpose,
                    'Uses Power': log.usesPower,
                    'Avg Power Draw (W)': log.avgPowerDrawWatts,
                    'Could Void Warranty': log.couldVoidWarranty,
                };
            case LogType.Fault:
                return {
                    ...base,
                    'Odometer': log.odometer,
                    'Fault Type': log.faultType,
                    'Description': log.description,
                    'Resolution': log.resolution,
                };
            case LogType.Satisfaction:
                return {
                    ...base,
                    'Rating (1-5)': log.rating,
                    'Comments': log.comments,
                };
            default:
                return base;
        }
    });
};

const createAnalyticsSummary = (state: AppState) => {
    const { logs } = state;
    
    const totalDistance = logs
        .filter((log): log is TripLog => log.type === LogType.Trip)
        .reduce((acc, log) => acc + (log.endOdometer - log.startOdometer), 0);
        
    const totalCost = logs
        .filter((log): log is ChargingLog | ServiceLog => log.type === LogType.Charging || log.type === LogType.Service)
        .reduce((acc, log) => acc + (log.cost || 0), 0);

    const chargingLogs = logs.filter((log): log is ChargingLog => log.type === LogType.Charging);
    const totalCharges = chargingLogs.length;

    const chargerTypeCounts = chargingLogs.reduce((acc, log) => {
        acc[log.chargerType] = (acc[log.chargerType] || 0) + 1;
        return acc;
    }, {} as Record<ChargerType, number>);

    return [
        { Metric: 'Total EVs Tracked', Value: state.evs.length },
        { Metric: 'Total Logbook Entries', Value: state.logs.length },
        { Metric: 'Total Distance Driven (mi)', Value: totalDistance.toLocaleString() },
        { Metric: 'Total Spent ($)', Value: totalCost.toFixed(2) },
        { Metric: 'Total Charging Sessions', Value: totalCharges },
        { Metric: 'Level 1 Charges', Value: chargerTypeCounts[ChargerType.L1] || 0 },
        { Metric: 'Level 2 Charges', Value: chargerTypeCounts[ChargerType.L2] || 0 },
        { Metric: 'DC Fast Charges', Value: chargerTypeCounts[ChargerType.DCFC] || 0 },
    ];
};

export const exportDataToExcel = (state: AppState) => {
    const XLSX = (window as any).XLSX;

    if (!XLSX) {
        alert("The export library (XLSX) is not available. Please check your internet connection and try again.");
        console.error("XLSX object not found on window.");
        return;
    }
    
    // 1. EV Details Sheet
    const evsWithSimpleMedia = state.evs.map(ev => ({
        ...ev,
        images: (ev.images || []).length,
        videos: (ev.videos || []).map(v => v.url).join(', '),
        reviews: (ev.reviews || []).map(r => `${r.title}: ${r.url}`).join(', '),
        socials: (ev.socials || []).map(s => `${s.platform}: ${s.url}`).join(', '),
    }));
    const evsSheet = XLSX.utils.json_to_sheet(evsWithSimpleMedia);

    // 2. Logbook Sheet
    const formattedLogs = formatLogsForExport(state.logs);
    const logbookSheet = XLSX.utils.json_to_sheet(formattedLogs);

    // 3. Analytics Summary Sheet
    const analyticsSummary = createAnalyticsSummary(state);
    const analyticsSheet = XLSX.utils.json_to_sheet(analyticsSummary);

    // Create Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, evsSheet, 'My EV Details');
    XLSX.utils.book_append_sheet(wb, logbookSheet, 'Logbook');
    XLSX.utils.book_append_sheet(wb, analyticsSheet, 'Analytics Summary');

    // Download file
    XLSX.writeFile(wb, 'ev_companion_data.xlsx');
};
