import { createClient } from "@supabase/supabase-js";
import Dexie from "dexie";

// 1. Initialize Cloud Connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Initialize Laptop Local Copy (IndexedDB via Dexie)
export const localDB = new Dexie("VABusinessSchedulerDB");

// We index 'user_id' so the app can isolate schedules if different VAs share a computer.
// We index 'synced' to easily track what needs to be pushed up to the cloud.
localDB.version(1).stores({
    appointments: "id, user_id, client_name, appointment_date, synced",
});
