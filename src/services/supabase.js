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
    
    // Add debugging
    console.log('Attempting to update route:', id);
    console.log('Current user ID:', user.id);
    console.log('Update data:', updates);
    
    const { data, error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    
    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    
    console.log('Update result:', data);
    
    // Check if any record was updated
    if (!data || data.length === 0) {
      // Let's also check if the route exists at all
      const { data: existingRoute } = await supabase
        .from('routes')
        .select('id, user_id')
        .eq('id', id)
        .single();
      
      if (!existingRoute) {
        throw new Error(`Route with ID ${id} does not exist`);
      } else if (existingRoute.user_id !== user.id) {
        throw new Error(`Route with ID ${id} belongs to user ${existingRoute.user_id}, but current user is ${user.id}`);
      } else {
        throw new Error('Route not found or you do not have permission to update it');
      }
    }
    
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

  // Category operations
  async getCategories() {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async addCategory(category) {
    const user = await getCurrentUser();
    const categoryWithUserId = {
      ...category,
      user_id: user.id
    };
    
    console.log('Adding category with data:', categoryWithUserId);
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryWithUserId)
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Category added successfully:', data);
    return data[0];
  },

  async updateCategory(id, updates) {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*');
    
    if (error) throw error;
    return data[0];
  },

  async deleteCategory(id) {
    const user = await getCurrentUser();
    
    // Check if category is being used by any routes
    const { data: routesUsingCategory, error: checkError } = await supabase
      .from('routes')
      .select('id')
      .eq('category_id', id)
      .eq('user_id', user.id);
    
    if (checkError) throw checkError;
    
    if (routesUsingCategory && routesUsingCategory.length > 0) {
      throw new Error('Cannot delete category that is being used by routes. Please reassign or delete the routes first.');
    }
    
    const { error } = await supabase
      .from('categories')
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