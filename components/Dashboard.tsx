
import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { EV, Log, LogType, ChargingLog, TripLog, ServiceLog, FaultLog, SatisfactionLog, PurchaseAccessoriesLog } from '../types';
import LogModal from './LogModal';
import { BoltIcon, PlusIcon, TrashIcon, CloseIcon, ImageIcon, VideoIcon, LinkIcon, GlobeIcon, LogbookIcon } from './icons';

const getLogDateString = (log: Log): string => {
    if ('startTime' in log) return log.startTime;
    if ('serviceDate' in log) return log.serviceDate;
    if ('faultDate' in log) return log.faultDate;
    if ('purchaseDate' in log) return log.purchaseDate;
    if ('logDate' in log) return log.logDate;
    return '';
}

const LogItem: React.FC<{log: Log, onDelete: (id: string) => void}> = ({ log, onDelete }) => {
    const renderLogDetails = () => {
        switch (log.type) {
            case LogType.Charging:
                const chargeLog = log as ChargingLog;
                return <p>Charged from {chargeLog.startSocPercent}% to {chargeLog.endSocPercent}% ({chargeLog.chargerType}).</p>;
            case LogType.Trip:
                const tripLog = log as TripLog;
                return <p>Trip of {tripLog.endOdometer - tripLog.startOdometer} miles. Odometer: {tripLog.endOdometer.toLocaleString()}</p>;
            case LogType.Service:
                const serviceLog = log as ServiceLog;
                return <p>Service: {serviceLog.description} at {serviceLog.odometer.toLocaleString()} miles.</p>;
            case LogType.PurchaseAccessories:
                const accLog = log as PurchaseAccessoriesLog;
                return <p>Purchased: {accLog.accessoryName}{accLog.cost ? ` for $${accLog.cost.toFixed(2)}` : ''}.</p>;
            case LogType.Fault:
                const faultLog = log as FaultLog;
                return <p>Fault: {faultLog.faultType} - {faultLog.description}.</p>;
            case LogType.Satisfaction:
                const satLog = log as SatisfactionLog;
                return <p>Satisfaction Rating: {satLog.rating}/5.</p>;
            default:
                return null;
        }
    };

    const getDate = () => {
        return getLogDateString(log);
    }

    return (
        <div className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
            <div>
                <p className="font-bold">{log.type} <span className="font-normal text-sm text-gray-400">- {new Date(getDate()).toLocaleString()}</span></p>
                <div className="text-gray-300 text-sm">{renderLogDetails()}</div>
            </div>
            <button onClick={() => onDelete(log.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5" /></button>
        </div>
    )
}

interface LogbookProps {
    ev: EV;
    showBackButton?: boolean;
    setCurrentView?: (view: string) => void;
    setSelectedEVId?: (id: string | null) => void;
}

const Logbook: React.FC<LogbookProps> = ({ ev, showBackButton, setCurrentView, setSelectedEVId }) => {
    const { state, dispatch } = useAppContext();
    const [logModal, setLogModal] = useState<{ isOpen: boolean, type: LogType | null }>({ isOpen: false, type: null });

    const evLogs = state.logs.filter(log => log.evId === ev.id).sort((a, b) => {
        const dateA = new Date(getLogDateString(a)).getTime();
        const dateB = new Date(getLogDateString(b)).getTime();
        return dateB - dateA;
    });

    const openLogModal = (type: LogType) => {
        setLogModal({ isOpen: true, type: type });
    };
    
    const handleDeleteLog = (logId: string) => {
        if(window.confirm('Are you sure you want to delete this log?')){
            dispatch({type: 'DELETE_LOG', payload: logId});
        }
    }

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h1 className="text-3xl font-bold text-white">{ev.year} {ev.make} {ev.model}</h1>
                    <p className="text-gray-400">Logbook</p>
                </div>
                {showBackButton && setCurrentView && setSelectedEVId && (
                    <button 
                        onClick={() => {
                            setSelectedEVId(null);
                            setCurrentView('evs');
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                        &larr; Back to My EVs
                    </button>
                )}
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Add New Log</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.values(LogType).map(type => (
                        <button key={type} onClick={() => openLogModal(type)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded flex items-center justify-center text-sm">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
                {evLogs.length > 0 ? (
                    <div className="space-y-4">
                        {evLogs.map(log => (
                            <LogItem key={log.id} log={log} onDelete={handleDeleteLog}/>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-800 rounded-lg">
                        <p className="text-gray-400">No logs recorded for this vehicle yet.</p>
                    </div>
                )}
            </div>

            {logModal.isOpen && logModal.type && (
                <LogModal evId={ev.id} logType={logModal.type} onClose={() => setLogModal({ isOpen: false, type: null })} />
            )}
        </div>
    );
};


const Dashboard: React.FC<{ setCurrentView: (view: string) => void }> = ({ setCurrentView }) => {
    const { state } = useAppContext();
    const { evs, logs } = state;

    if (evs.length === 0) {
        return (
            <div className="flex-grow flex flex-col justify-center items-center text-center p-8">
                <BoltIcon className="w-24 h-24 text-gray-700" />
                <h1 className="text-4xl font-bold mt-4">Welcome to EV Companion</h1>
                <p className="text-lg text-gray-400 mt-2">Start by adding your electric vehicle to begin logging.</p>
                <button 
                    onClick={() => setCurrentView('evs')}
                    className="mt-8 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center"
                >
                    <PlusIcon className="h-6 w-6 mr-2" />
                    Add Your First EV
                </button>
            </div>
        );
    }
    
    const totalDistance = logs
        .filter((log): log is TripLog => log.type === LogType.Trip)
        .reduce((acc, log) => acc + (log.endOdometer - log.startOdometer), 0);
        
    const totalCost = logs
        .filter((log): log is ChargingLog | ServiceLog => log.type === LogType.Charging || log.type === LogType.Service)
        .reduce((acc, log) => acc + (log.cost || 0), 0);

    const totalCharges = logs.filter(log => log.type === LogType.Charging).length;

    const favoriteEV = evs[0];

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-5 rounded-lg"><h3 className="text-gray-400">Total Distance Driven</h3><p className="text-3xl font-bold">{totalDistance.toLocaleString()} mi</p></div>
                <div className="bg-gray-800 p-5 rounded-lg"><h3 className="text-gray-400">Total Spent</h3><p className="text-3xl font-bold">${totalCost.toFixed(2)}</p></div>
                <div className="bg-gray-800 p-5 rounded-lg"><h3 className="text-gray-400">Charging Sessions</h3><p className="text-3xl font-bold">{totalCharges}</p></div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Primary Vehicle Logbook</h2>
                <Logbook ev={favoriteEV} />
            </div>
        </div>
    )
};

// --- New EV Detail Component and Helpers ---

const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const AddLinkModal: React.FC<{
    title: string;
    fields: { name: string, placeholder: string }[];
    onClose: () => void;
    onSave: (values: Record<string, string>) => void;
}> = ({ title, fields, onClose, onSave }) => {
    const [values, setValues] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(values);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map(field => (
                        <input key={field.name} name={field.name} onChange={handleChange} placeholder={field.placeholder} required className="bg-gray-700 p-2 rounded w-full" />
                    ))}
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2">Cancel</button>
                        <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface EVDetailProps {
    ev: EV;
    setCurrentView: (view: string) => void;
    setSelectedEVId: (id: string) => void;
}

const EVDetail: React.FC<EVDetailProps> = ({ ev, setCurrentView, setSelectedEVId }) => {
    const { dispatch } = useAppContext();
    const [modal, setModal] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleUpdateEV = (updatedEV: EV) => {
        dispatch({ type: 'UPDATE_EV', payload: updatedEV });
    };

    // Image Handlers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const updatedEV = { ...ev, images: [...(ev.images || []), event.target?.result as string] };
                handleUpdateEV(updatedEV);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const handleDeleteImage = (index: number) => {
        if (window.confirm("Delete this image?")) {
            const updatedImages = [...(ev.images || [])];
            updatedImages.splice(index, 1);
            handleUpdateEV({ ...ev, images: updatedImages });
        }
    };

    // Video Handlers
    const handleAddVideo = (values: {url: string}) => {
        const videoId = getYouTubeVideoId(values.url);
        if (!videoId) {
            alert("Please enter a valid YouTube URL.");
            return;
        }
        const newVideo = { id: crypto.randomUUID(), url: values.url };
        const updatedVideos = [...(ev.videos || []), newVideo];
        handleUpdateEV({ ...ev, videos: updatedVideos });
        setModal(null);
    };
    const handleDeleteVideo = (id: string) => {
        if (window.confirm("Delete this video?")) {
            const updatedVideos = (ev.videos || []).filter(v => v.id !== id);
            handleUpdateEV({ ...ev, videos: updatedVideos });
        }
    };
    
    // Review Handlers
    const handleAddReview = (values: {title: string, url: string}) => {
        const newReview = { id: crypto.randomUUID(), ...values };
        const updatedReviews = [...(ev.reviews || []), newReview];
        handleUpdateEV({ ...ev, reviews: updatedReviews });
        setModal(null);
    };
    const handleDeleteReview = (id: string) => {
         if (window.confirm("Delete this review link?")) {
            const updatedReviews = (ev.reviews || []).filter(r => r.id !== id);
            handleUpdateEV({ ...ev, reviews: updatedReviews });
        }
    };

    // Social Handlers
    const handleAddSocial = (values: {platform: string, url: string}) => {
        const newSocial = { id: crypto.randomUUID(), ...values };
        const updatedSocials = [...(ev.socials || []), newSocial];
        handleUpdateEV({ ...ev, socials: updatedSocials });
        setModal(null);
    };
    const handleDeleteSocial = (id: string) => {
        if (window.confirm("Delete this social link?")) {
            const updatedSocials = (ev.socials || []).filter(s => s.id !== id);
            handleUpdateEV({ ...ev, socials: updatedSocials });
        }
    };
    
    const Section: React.FC<{title: string, icon: React.ReactNode, onAdd: () => void, children: React.ReactNode, addText: string}> = ({title, icon, onAdd, children, addText}) => (
        <section className="bg-gray-900/50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center">{icon}<span className="ml-3">{title}</span></h2>
                <button onClick={onAdd} className="bg-brand-primary/80 hover:bg-brand-primary text-white font-bold py-2 px-4 rounded flex items-center text-sm">
                    <PlusIcon className="h-5 w-5 mr-2" /> {addText}
                </button>
            </div>
            {children}
        </section>
    );

    return (
        <>
            <div className="space-y-8">
                <Section title="Image Gallery" icon={<ImageIcon className="h-6 w-6"/>} onAdd={() => imageInputRef.current?.click()} addText="Add Image">
                    <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
                    {(ev.images?.length || 0) > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {ev.images?.map((img, i) => (
                                <div key={i} className="relative group aspect-square">
                                    <img src={img} alt={`EV Image ${i+1}`} className="rounded-lg object-cover w-full h-full" />
                                    <button onClick={() => handleDeleteImage(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-4 w-4"/></button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-400">No images added yet.</p>}
                </Section>
                
                <Section title="Video Gallery" icon={<VideoIcon className="h-6 w-6"/>} onAdd={() => setModal('video')} addText="Add Video">
                     {(ev.videos?.length || 0) > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {ev.videos?.map(video => {
                                const videoId = getYouTubeVideoId(video.url);
                                if (!videoId) return null;
                                return (
                                    <a key={video.id} href={video.url} target="_blank" rel="noopener noreferrer" className="relative group aspect-video">
                                        <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="YouTube Video Thumbnail" className="rounded-lg object-cover w-full h-full" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                                        </div>
                                        <button onClick={(e) => { e.preventDefault(); handleDeleteVideo(video.id); }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-4 w-4"/></button>
                                    </a>
                                );
                            })}
                        </div>
                    ) : <p className="text-gray-400">No videos added yet.</p>}
                </Section>

                <Section title="Blogs & Reviews" icon={<LinkIcon className="h-6 w-6"/>} onAdd={() => setModal('review')} addText="Add Link">
                     {(ev.reviews?.length || 0) > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {ev.reviews?.map(review => (
                                <a key={review.id} href={review.url} target="_blank" rel="noopener noreferrer" className="relative group bg-gray-700 p-4 rounded-lg hover:bg-gray-600 block">
                                    <p className="font-bold text-white truncate">{review.title}</p>
                                    <p className="text-sm text-brand-primary truncate">{review.url}</p>
                                    <button onClick={(e) => { e.preventDefault(); handleDeleteReview(review.id); }} className="absolute top-2 right-2 bg-black/20 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-4 w-4"/></button>
                                </a>
                            ))}
                        </div>
                    ) : <p className="text-gray-400">No review links added yet.</p>}
                </Section>
                
                <Section title="Social Media" icon={<GlobeIcon className="h-6 w-6"/>} onAdd={() => setModal('social')} addText="Add Link">
                     {(ev.socials?.length || 0) > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {ev.socials?.map(social => (
                                <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="relative group bg-gray-700 p-4 rounded-lg hover:bg-gray-600 block">
                                    <p className="font-bold text-white truncate">{social.platform}</p>
                                    <p className="text-sm text-brand-primary truncate">{social.url}</p>
                                    <button onClick={(e) => { e.preventDefault(); handleDeleteSocial(social.id); }} className="absolute top-2 right-2 bg-black/20 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-4 w-4"/></button>
                                </a>
                            ))}
                        </div>
                    ) : <p className="text-gray-400">No social media links added yet.</p>}
                </Section>

                <div className="pt-8 border-t border-gray-700/50">
                    <button
                        onClick={() => {
                            setSelectedEVId(ev.id);
                            setCurrentView('logbook');
                        }}
                        className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-base transition-colors"
                    >
                        <LogbookIcon className="h-5 w-5 mr-3" />
                        Go to Logbook
                    </button>
                </div>
            </div>
            
            {modal === 'video' && <AddLinkModal title="Add YouTube Video" fields={[{name: 'url', placeholder: 'YouTube URL'}]} onClose={() => setModal(null)} onSave={handleAddVideo} />}
            {modal === 'review' && <AddLinkModal title="Add Blog/Review Link" fields={[{name: 'title', placeholder: 'Title'}, {name: 'url', placeholder: 'URL'}]} onClose={() => setModal(null)} onSave={(v) => handleAddReview(v as {title: string, url: string})} />}
            {modal === 'social' && <AddLinkModal title="Add Social Media Link" fields={[{name: 'platform', placeholder: 'Platform (e.g., Twitter, Instagram)'}, {name: 'url', placeholder: 'URL'}]} onClose={() => setModal(null)} onSave={(v) => handleAddSocial(v as {platform: string, url: string})} />}
        </>
    );
};

export { Dashboard, Logbook, EVDetail };
