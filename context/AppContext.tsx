
import React, { createContext, useReducer, useEffect, useContext, ReactNode, Dispatch } from 'react';
import { AppState, AppAction, EV, Log } from '../types';

const initialState: AppState = {
  evs: [],
  logs: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_EV':
      return { ...state, evs: [...state.evs, action.payload] };
    case 'UPDATE_EV':
      return {
        ...state,
        evs: state.evs.map((ev) => (ev.id === action.payload.id ? action.payload : ev)),
      };
    case 'DELETE_EV':
      return {
        ...state,
        evs: state.evs.filter((ev) => ev.id !== action.payload),
        logs: state.logs.filter((log) => log.evId !== action.payload),
      };
    case 'ADD_LOG':
      return { ...state, logs: [...state.logs, action.payload] };
    case 'DELETE_LOG':
        return {
            ...state,
            logs: state.logs.filter((log) => log.id !== action.payload)
        }
    case 'SET_STATE':
        return action.payload;
    case 'DELETE_ALL_DATA':
        return initialState;
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('evCompanionState');
      if (storedState) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(storedState) });
      }
    } catch (error) {
      console.error("Could not load state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('evCompanionState', JSON.stringify(state));
    } catch (error) {
      console.error("Could not save state to localStorage", error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
