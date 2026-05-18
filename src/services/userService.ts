import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    console.log('Fetching profile for user:', uid);
    
    // Add timeout for profile fetch - fail fast if user doesn't exist
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
    );

    const fetchPromise = supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      if (error.code === 'PGRST116' || error.message === 'Profile fetch timeout') {
        // No rows returned or timeout - likely new user
        console.log('Profile not found (new user):', uid);
        return null;
      }
      throw error;
    }

    console.log('Profile found:', data.username);
    // Map database columns to TypeScript interface (snake_case to camelCase)
    return {
      uid: data.id,
      username: data.username,
      displayName: data.display_name,
      photoURL: data.photo_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      hasSyncedContacts: data.has_synced_contacts,
      hasSetupWidget: data.has_setup_widget,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const checkUsernameUnique = async (username: string): Promise<boolean> => {
  try {
    // Validate username format
    if (!username || username.length < 3) {
      console.log('Username too short:', username);
      return false; // Invalid username
    }

    const lowerUsername = username.toLowerCase();
    console.log('Checking username uniqueness for:', lowerUsername);

    // Simple query without timeout - let it complete
    const { data, error, status } = await supabase
      .from('users')
      .select('id')
      .eq('username', lowerUsername);

    console.log('Query response:', { status, data, error });

    if (error) {
      console.error('Error checking username:', error.message, error.code);
      // On error (likely RLS), assume it's unique - let create handle it
      // If username exists, create will fail with duplicate error
      console.log('Assuming username is unique due to error');
      return true;
    }
    
    // If data is null or empty array, username is unique
    const isUnique = !data || data.length === 0;
    console.log('Username unique?', isUnique, 'Data:', data);
    return isUnique;
  } catch (error: any) {
    console.error('Error checking username uniqueness:', error.message);
    // Return true on error - let profile creation handle the duplicate error
    return true;
  }
};

export const createUserProfile = async (profile: Partial<UserProfile>): Promise<void> => {
  if (!profile.uid) {
    throw new Error('UID is required');
  }

  try {
    const userId = profile.uid;
    
    console.log('Creating user profile for:', userId);
    
    // Add timeout to prevent hanging - 5 seconds (faster)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Profile creation timeout. Please check your connection and try again.')), 5000)
    );

    const insertPromise = supabase
      .from('users')
      .insert({
        id: userId,
        username: profile.username?.toLowerCase(),
        display_name: profile.displayName,
        photo_url: profile.photoURL,
        has_synced_contacts: profile.hasSyncedContacts || false,
        has_setup_widget: profile.hasSetupWidget || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    const { error } = await Promise.race([insertPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    console.log('Profile created successfully');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.username) updateData.username = data.username.toLowerCase();
    if (data.displayName) updateData.display_name = data.displayName;
    if (data.photoURL) updateData.photo_url = data.photoURL;
    if (data.hasSyncedContacts !== undefined) updateData.has_synced_contacts = data.hasSyncedContacts;
    if (data.hasSetupWidget !== undefined) updateData.has_setup_widget = data.hasSetupWidget;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', uid);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
