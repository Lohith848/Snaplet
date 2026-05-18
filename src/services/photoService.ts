import { supabase } from '../lib/supabase';
import { Photo, Friendship } from '../types';

export const sendPhoto = async (
  senderId: string,
  senderName: string,
  senderPhoto: string,
  imageUrl: string,
  recipientIds: string[]
) => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .insert({
        sender_id: senderId,
        sender_name: senderName,
        sender_photo: senderPhoto,
        image_url: imageUrl,
        caption: '',
        recipient_ids: recipientIds,
        reactions: {},
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error sending photo:', error);
    throw error;
  }
};

export const reactToPhoto = async (photoId: string, userId: string, emoji: string) => {
  try {
    // Get current reactions
    const { data: photoData, error: fetchError } = await supabase
      .from('photos')
      .select('reactions')
      .eq('id', photoId)
      .single();

    if (fetchError) throw fetchError;

    // Update reactions with new emoji
    const reactions = photoData?.reactions || {};
    reactions[userId] = emoji;

    const { error: updateError } = await supabase
      .from('photos')
      .update({ reactions })
      .eq('id', photoId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error reacting to photo:', error);
    throw error;
  }
};

export const getFriends = async (userId: string): Promise<Friendship[]> => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) throw error;

    const friendIds = data?.map(f => f.friend_id) || [];
    
    if (friendIds.length === 0) return [];

    // Fetch friend details
    const { data: friendsData, error: friendsError } = await supabase
      .from('users')
      .select('*')
      .in('id', friendIds);

    if (friendsError) throw friendsError;

    return (friendsData || []).map(user => ({
      uid: user.id,
      username: user.username,
      displayName: user.display_name,
      photoURL: user.photo_url,
      status: 'accepted' as const,
      updatedAt: user.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
};

export const subscribeToFeed = (
  userId: string,
  friendIds: string[],
  callback: (photos: Photo[]) => void
) => {
  // Initial fetch
  fetchFeed(userId, friendIds).then(callback);

  // Set up real-time subscription
  const channel = supabase
    .channel(`feed:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'photos',
      },
      (payload) => {
        // Re-fetch feed on any changes
        fetchFeed(userId, friendIds).then(callback);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

const fetchFeed = async (userId: string, friendIds: string[]): Promise<Photo[]> => {
  try {
    let queryBuilder = supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (friendIds.length === 0) {
      queryBuilder = queryBuilder.eq('sender_id', userId);
    } else {
      queryBuilder = queryBuilder.filter(
        'recipient_ids',
        'cs',
        `["${userId}"]`
      );
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;

    return (data || []).map(photo => ({
      id: photo.id,
      senderId: photo.sender_id,
      senderName: photo.sender_name,
      senderPhoto: photo.sender_photo,
      imageUrl: photo.image_url,
      caption: photo.caption,
      createdAt: photo.created_at,
      recipientIds: photo.recipient_ids,
      reactions: photo.reactions || {},
    }));
  } catch (error) {
    console.error('Error fetching feed:', error);
    return [];
  }
};
