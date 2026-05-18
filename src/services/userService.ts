import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const checkUsernameUnique = async (username: string): Promise<boolean> => {
  try {
    // Validate username format
    if (!username || username.length < 3) {
      return false; // Invalid username
    }

    const { data, error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('username', username.toLowerCase());

    if (error) {
      console.error('Error checking username:', error);
      // On error, assume it's unique (better UX than blocking)
      return true;
    }
    
    // Returns true if NO usernames found (unique), false if found (taken)
    return !data || data.length === 0;
  } catch (error) {
    console.error('Error checking username uniqueness:', error);
    // Return true on error (assume unique) - better UX
    return true;
  }
};

export const createUserProfile = async (profile: Partial<UserProfile>): Promise<void> => {
  if (!profile.uid) {
    throw new Error('UID is required');
  }

  try {
    const userId = profile.uid;
    
    const { error } = await supabase
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

    if (error) throw error;
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
