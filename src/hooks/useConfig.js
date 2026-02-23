import { useData } from '../context/DataContext';

/**
 * Config hook — provides access to loaded config files.
 */
export function useConfig() {
  const { config } = useData();
  return config;
}
