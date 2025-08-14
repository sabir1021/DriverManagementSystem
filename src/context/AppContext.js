import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Alert } from 'react-native';
import { databaseService } from '../services/supabase';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  drivers: [],
  vehicles: [],
  routes: [],
  assignments: [],
  loading: false,
  error: null,
};

// Action types
export const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_DRIVER: 'ADD_DRIVER',
  UPDATE_DRIVER: 'UPDATE_DRIVER',
  DELETE_DRIVER: 'DELETE_DRIVER',
  ADD_VEHICLE: 'ADD_VEHICLE',
  UPDATE_VEHICLE: 'UPDATE_VEHICLE',
  DELETE_VEHICLE: 'DELETE_VEHICLE',
  SET_DRIVERS: 'SET_DRIVERS',
  SET_VEHICLES: 'SET_VEHICLES',
  ADD_ROUTE: 'ADD_ROUTE',
  UPDATE_ROUTE: 'UPDATE_ROUTE',
  DELETE_ROUTE: 'DELETE_ROUTE',
  SET_ROUTES: 'SET_ROUTES',
  SET_ASSIGNMENTS: 'SET_ASSIGNMENTS',
  ADD_ASSIGNMENT: 'ADD_ASSIGNMENT',
  UPDATE_ASSIGNMENT: 'UPDATE_ASSIGNMENT',
  DELETE_ASSIGNMENT: 'DELETE_ASSIGNMENT',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTION_TYPES.SET_DRIVERS:
      return { ...state, drivers: action.payload, loading: false };
    
    case ACTION_TYPES.SET_VEHICLES:
      return { ...state, vehicles: action.payload, loading: false };
    
    case ACTION_TYPES.SET_ROUTES:
      return { ...state, routes: action.payload, loading: false };
    
    case ACTION_TYPES.ADD_DRIVER:
      return {
        ...state,
        drivers: [...state.drivers, action.payload],
        loading: false,
      };
    
    case ACTION_TYPES.UPDATE_DRIVER:
      return {
        ...state,
        drivers: state.drivers.map(driver => 
          driver.id === action.payload.id ? action.payload : driver
        ),
        loading: false,
      };
    
    case ACTION_TYPES.DELETE_DRIVER:
      return {
        ...state,
        drivers: state.drivers.filter(driver => driver.id !== action.payload),
        loading: false,
      };
    
    case ACTION_TYPES.ADD_VEHICLE:
      return {
        ...state,
        vehicles: [...state.vehicles, action.payload],
        loading: false,
      };
    
    case ACTION_TYPES.UPDATE_VEHICLE:
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle => 
          vehicle.id === action.payload.id ? action.payload : vehicle
        ),
        loading: false,
      };
    
    case ACTION_TYPES.DELETE_VEHICLE:
      return {
        ...state,
        vehicles: state.vehicles.filter(vehicle => vehicle.id !== action.payload),
        loading: false,
      };
    
    case ACTION_TYPES.ADD_ROUTE:
      return {
        ...state,
        routes: [...state.routes, action.payload],
        loading: false,
      };
    
    case ACTION_TYPES.UPDATE_ROUTE:
      return {
        ...state,
        routes: state.routes.map(route => 
          route.id === action.payload.id ? action.payload : route
        ),
        loading: false,
      };
    
    case ACTION_TYPES.DELETE_ROUTE:
      return {
        ...state,
        routes: state.routes.filter(route => route.id !== action.payload),
        loading: false,
      };
    
    case ACTION_TYPES.SET_ASSIGNMENTS:
      return {
        ...state,
        assignments: action.payload,
        loading: false,
      };
    
    case ACTION_TYPES.ADD_ASSIGNMENT:
      return {
        ...state,
        assignments: [action.payload, ...state.assignments],
        loading: false,
      };
    
    case ACTION_TYPES.UPDATE_ASSIGNMENT:
      return {
        ...state,
        assignments: state.assignments.map(assignment => 
          assignment.id === action.payload.id ? action.payload : assignment
        ),
        loading: false,
      };
    
    case ACTION_TYPES.DELETE_ASSIGNMENT:
      return {
        ...state,
        assignments: state.assignments.filter(assignment => assignment.id !== action.payload),
        loading: false,
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load data when user changes or app starts
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    } else {
      // Clear data when user signs out
      dispatch({ type: ACTION_TYPES.SET_DRIVERS, payload: [] });
      dispatch({ type: ACTION_TYPES.SET_VEHICLES, payload: [] });
      dispatch({ type: ACTION_TYPES.SET_ROUTES, payload: [] });
      dispatch({ type: ACTION_TYPES.SET_ASSIGNMENTS, payload: [] });
    }
  }, [user, isAuthenticated]);

  const loadInitialData = async () => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      
      const [driversData, vehiclesData, routesData, assignmentsData] = await Promise.all([
        databaseService.getDrivers(),
        databaseService.getVehicles(),
        databaseService.getRoutes(),
        databaseService.getAssignments()
      ]);
      
      dispatch({ type: ACTION_TYPES.SET_DRIVERS, payload: driversData });
      dispatch({ type: ACTION_TYPES.SET_VEHICLES, payload: vehiclesData });
      dispatch({ type: ACTION_TYPES.SET_ROUTES, payload: routesData });
      dispatch({ type: ACTION_TYPES.SET_ASSIGNMENTS, payload: assignmentsData });
    } catch (error) {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Updated action creators with Supabase integration
  const actions = {
    setLoading: (loading) => dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error }),
    
    // Driver actions
    setDrivers: (drivers) => dispatch({ type: ACTION_TYPES.SET_DRIVERS, payload: drivers }),
    addDriver: async (driver) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        console.log('Sending driver data:', driver);
        const newDriver = await databaseService.addDriver(driver);
        dispatch({ type: ACTION_TYPES.ADD_DRIVER, payload: newDriver });
      } catch (error) {
        console.error('Error adding driver:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        Alert.alert('Error', `Failed to add driver: ${error.message}`);
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    updateDriver: async (driver) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        const updatedDriver = await databaseService.updateDriver(driver.id, driver);
        dispatch({ type: ACTION_TYPES.UPDATE_DRIVER, payload: updatedDriver });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    deleteDriver: async (id) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        console.log('Deleting driver with id:', id);
        await databaseService.deleteDriver(id);
        dispatch({ type: ACTION_TYPES.DELETE_DRIVER, payload: id });
        Alert.alert('Success', 'Driver deleted successfully!');
      } catch (error) {
        console.error('Error deleting driver:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        Alert.alert('Error', `Failed to delete driver: ${error.message}`);
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    
    // Vehicle actions
    setVehicles: (vehicles) => dispatch({ type: ACTION_TYPES.SET_VEHICLES, payload: vehicles }),
    addVehicle: async (vehicle) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        console.log('Adding vehicle with data:', vehicle);
        const newVehicle = await databaseService.addVehicle(vehicle);
        dispatch({ type: ACTION_TYPES.ADD_VEHICLE, payload: newVehicle });
      } catch (error) {
        console.error('Error adding vehicle:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        Alert.alert('Error', `Failed to add vehicle: ${error.message}`);
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    updateVehicle: async (vehicle) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        const updatedVehicle = await databaseService.updateVehicle(vehicle.id, vehicle);
        dispatch({ type: ACTION_TYPES.UPDATE_VEHICLE, payload: updatedVehicle });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    deleteVehicle: async (id) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        console.log('Deleting vehicle with id:', id);
        await databaseService.deleteVehicle(id);
        dispatch({ type: ACTION_TYPES.DELETE_VEHICLE, payload: id });
        Alert.alert('Success', 'Vehicle deleted successfully!');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        Alert.alert('Error', `Failed to delete vehicle: ${error.message}`);
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },

    // Route actions
    setRoutes: (routes) => dispatch({ type: ACTION_TYPES.SET_ROUTES, payload: routes }),
    addRoute: async (route) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        console.log('Adding route with data:', route);
        const newRoute = await databaseService.addRoute(route);
        dispatch({ type: ACTION_TYPES.ADD_ROUTE, payload: newRoute });
      } catch (error) {
        console.error('Error adding route:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        Alert.alert('Error', `Failed to add route: ${error.message}`);
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    updateRoute: async (route) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        const updatedRoute = await databaseService.updateRoute(route.id, route);
        dispatch({ type: ACTION_TYPES.UPDATE_ROUTE, payload: updatedRoute });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    deleteRoute: async (id) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        console.log('Deleting route with id:', id);
        await databaseService.deleteRoute(id);
        dispatch({ type: ACTION_TYPES.DELETE_ROUTE, payload: id });
        Alert.alert('Success', 'Route deleted successfully!');
      } catch (error) {
        console.error('Error deleting route:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        Alert.alert('Error', `Failed to delete route: ${error.message}`);
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    
    // Assignment actions
    setAssignments: (assignments) => dispatch({ type: ACTION_TYPES.SET_ASSIGNMENTS, payload: assignments }),
    addAssignment: async (assignment) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        console.log('Adding assignment with data:', assignment);
        const newAssignment = await databaseService.addAssignment(assignment);
        dispatch({ type: ACTION_TYPES.ADD_ASSIGNMENT, payload: newAssignment });
        Alert.alert('Success', 'Assignment created successfully!');
      } catch (error) {
        console.error('Error adding assignment:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        Alert.alert('Error', `Failed to create assignment: ${error.message}`);
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    updateAssignment: async (assignment) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        const updatedAssignment = await databaseService.updateAssignment(assignment.id, assignment);
        dispatch({ type: ACTION_TYPES.UPDATE_ASSIGNMENT, payload: updatedAssignment });
        Alert.alert('Success', 'Assignment updated successfully!');
      } catch (error) {
        console.error('Error updating assignment:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        Alert.alert('Error', `Failed to update assignment: ${error.message}`);
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    deleteAssignment: async (id) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        console.log('Deleting assignment with id:', id);
        await databaseService.deleteAssignment(id);
        dispatch({ type: ACTION_TYPES.DELETE_ASSIGNMENT, payload: id });
        Alert.alert('Success', 'Assignment deleted successfully!');
      } catch (error) {
        console.error('Error deleting assignment:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        Alert.alert('Error', `Failed to delete assignment: ${error.message}`);
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
  };

  return (
    <AppContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};