import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
'https://imzcmktofhaowanqbeoe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltemNta3RvZmhhb3dhbnFiZW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2Njc5OTksImV4cCI6MjA2MTI0Mzk5OX0.MyZjlh7rj9wKdDTWR53BexTRrKTPPlUfZ1IBAdKweyA'
);