import { createSignal } from 'solid-js';

type PageData =
  | {
      name: 'songs' | 'artists' | 'albums';
    }
  | {
      name: 'search';
      query: string;
    };

export const [currentPage, setCurrentPage] = createSignal<PageData>({
  name: 'songs',
});
