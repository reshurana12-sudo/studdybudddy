import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        // Load theme preference from profile
        supabase
          .from('profiles')
          .select('theme_preference')
          .eq('user_id', user.id)
          .single()
          .then(({ data }) => {
            if (data?.theme_preference) {
              applyTheme(data.theme_preference as Theme);
            } else {
              applyTheme('dark');
            }
          });
      }
    });
  }, []);

  const applyTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    applyTheme(newTheme);
    
    // Save to database if user is logged in
    if (userId) {
      await supabase
        .from('profiles')
        .update({ theme_preference: newTheme })
        .eq('user_id', userId);
    }
  };

  return { theme, setTheme };
};
