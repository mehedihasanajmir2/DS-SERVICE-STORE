
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://unayzcxqokmycqveiilf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuYXl6Y3hxb2tteWNxdmVpaWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzUyMzUsImV4cCI6MjA4NjMxMTIzNX0.SE8AmWHrct79ZErLTvWRTGaLJfZz3MawKujVZ6QSlX8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
