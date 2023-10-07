import { createSignal } from 'solid-js';

export const MainPages = [
  'songs',
  'artists',
  'albums',
  'search',
  'settings',
  'about',
  'library Manager',
] as const;

export type SearchPageData = {
  query: string;
  isManager: boolean;
};

export type PageData =
  | {
      name: (typeof MainPages)[number];
      data?: undefined;
    }
  | {
      name: 'search';
      data: SearchPageData;
    }
  | {
      name: 'artist';
      data: string;
    }
  | {
      name: 'album';
      data: string;
    };

const [currentPage, setCurrentPage] = createSignal<PageData>({
  name: 'songs',
});

let previousPages: PageData[] = [];

export const goBack = () => {
  setCurrentPage(
    previousPages.pop() || {
      name: 'songs',
    },
  );
};

export const navigate = (page: PageData) => {
  if (MainPages.includes(page.name)) previousPages = [];
  else previousPages.push(currentPage());
  setCurrentPage(page);
};

export { currentPage };
