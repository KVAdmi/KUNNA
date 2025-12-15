import { supabase } from '../config/supabaseClient';

export const checkRoomPin = async (room, pin) => {
  try {
    const { data, error } = await supabase
      .from('conference_pins')
      .select('*')
      .eq('room', room)
      .single();

    if (error) throw error;
    
    if (!data) return false;
    
    // Verificar validez temporal
    const now = new Date();
    if (data.valid_from && new Date(data.valid_from) > now) return false;
    if (data.valid_to && new Date(data.valid_to) < now) return false;
    
    // Verificar número de usos
    if (data.max_uses && data.uses_count >= data.max_uses) return false;
    
    // Verificar el pin
    if (data.pin_hash !== pin) return false;
    
    // Incrementar el contador de usos
    const { error: updateError } = await supabase
      .from('conference_pins')
      .update({ uses_count: (data.uses_count || 0) + 1 })
      .eq('id', data.id);
    
    if (updateError) console.error('Error updating uses count:', updateError);
    
    return true;
  } catch (error) {
    console.error('Error checking room pin:', error);
    return false;
  }
};
