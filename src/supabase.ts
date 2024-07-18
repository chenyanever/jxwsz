import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://okgawerlpvbqbbdgjyzk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZ2F3ZXJscHZicWJiZGdqeXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExMTg5MTksImV4cCI6MjAzNjY5NDkxOX0.QQ7fQmWMDObI0smSQ7A-xYICY4aM3BqlGQZ7IA4huX8';
export const supabase = createClient(supabaseUrl, supabaseKey);