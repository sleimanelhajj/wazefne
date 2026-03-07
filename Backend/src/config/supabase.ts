import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; // You can also use anon key here if preferred, but service role bypasses RLS for backend operations

export const supabase = createClient(supabaseUrl, supabaseKey);
