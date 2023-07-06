import { createClient } from '@rspc/client';
import { TauriTransport } from '@rspc/tauri';
import { Procedures } from './gen/tauri-types';

export const api = createClient<Procedures>({
  transport: new TauriTransport(),
});
