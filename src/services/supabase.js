import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tutmvgzrmiqrdubmdgqu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1dG12Z3pybWlxcmR1Ym1kZ3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NzE5MTEsImV4cCI6MjA3MDQ0NzkxMX0.lkJn5t-qYeLQrk9lUJojRBiq-8srmSd7YqZUdap0-UQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get current user
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  // Add debugging
  console.log('Current user ID:', user.id);
  console.log('Current user email:', user.email);
  
  return user;
};

// Database service functions
export const databaseService = {
  // Driver operations
  async getDrivers() {
    const user = await getCurrentUser();
    console.log('Fetching drivers for user ID:', user.id);
    
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('Found drivers:', data);
    console.log('Number of drivers found:', data?.length || 0);
    
    return data;
  },

  async addDriver(driver) {
    const user = await getCurrentUser();
    const driverWithUserId = {
      ...driver,
      user_id: user.id
    };
    
    console.log('Adding driver with data:', driverWithUserId);
    const { data, error } = await supabase
      .from('drivers')
      .insert(driverWithUserId)
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Supabase response:', data);
    return data[0];
  },

  async updateDriver(id, updates) {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('drivers')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async deleteDriver(id) {
    const user = await getCurrentUser();
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
  },

  // Vehicle operations
  async getVehicles() {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addVehicle(vehicle) {
    const user = await getCurrentUser();
    const vehicleWithUserId = {
      ...vehicle,
      user_id: user.id
    };
    
    console.log('Adding vehicle with data:', vehicleWithUserId);
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicleWithUserId)
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Supabase response:', data);
    return data[0];
  },

  async updateVehicle(id, updates) {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async deleteVehicle(id) {
    const user = await getCurrentUser();
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
  },

  // Route operations
  async getRoutes() {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addRoute(route) {
    const user = await getCurrentUser();
    const routeWithUserId = {
      ...route,
      user_id: user.id
    };
    
    console.log('Adding route with data:', routeWithUserId);
    const { data, error } = await supabase
      .from('routes')
      .insert(routeWithUserId)
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Supabase response:', data);
    return data[0];
  },

  async updateRoute(id, updates) {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async deleteRoute(id) {
    const user = await getCurrentUser();
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
  },

  // Assignment operations
  async getAssignments() {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        driver:drivers(*),
        vehicle:vehicles(*),
        route:routes(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAssignmentsByDriver(driverId) {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        vehicle:vehicles(*),
        route:routes(*)
      `)
      .eq('driver_id', driverId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getActiveAssignments() {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        driver:drivers(*),
        vehicle:vehicles(*),
        route:routes(*)
      `)
      .eq('status', 'active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addAssignment(assignment) {
    const user = await getCurrentUser();
    
    // Check if vehicle is already assigned to an active assignment
    if (assignment.status === 'active') {
      const { data: existingAssignments, error: checkError } = await supabase
        .from('assignments')
        .select('id')
        .eq('vehicle_id', assignment.vehicle_id)
        .eq('status', 'active')
        .eq('user_id', user.id);
      
      if (checkError) {
        console.error('Error checking existing assignments:', checkError);
        throw checkError;
      }
      
      if (existingAssignments && existingAssignments.length > 0) {
        throw new Error('This vehicle is already assigned to an active assignment. Please choose a different vehicle or complete the existing assignment first.');
      }
    }
    
    const assignmentWithUserId = {
      ...assignment,
      user_id: user.id
    };
    
    console.log('Adding assignment with data:', assignmentWithUserId);
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignmentWithUserId)
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Assignment added successfully:', data);
    return data[0];
  },

  async updateAssignment(id, updates) {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        driver:drivers(*),
        vehicle:vehicles(*),
        route:routes(*)
      `);
    
    if (error) throw error;
    return data[0];
  },

  async deleteAssignment(id) {
    const user = await getCurrentUser();
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
  },

  // Temporary debug function - remove after debugging
  async getAllDriversDebug() {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('ALL drivers in database:', data);
    data?.forEach(driver => {
      console.log(`Driver: ${driver.name}, User ID: ${driver.user_id}`);
    });
    
    return data;
  },
};

// Authentication service functions
export const authService = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Create a more detailed error object
      const enhancedError = new Error(error.message);
      enhancedError.code = error.code || error.error_code;
      enhancedError.status = error.status;
      enhancedError.originalError = error;
      throw enhancedError;
    }
    
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};