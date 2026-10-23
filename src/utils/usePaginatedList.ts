import { useCallback, useEffect, useRef, useState } from 'react';

import { PageLoader, PageLoaderState, PageResponse } from './pagination';

/**
 * Liste paginée d'un écran : première page à l'ouverture, page suivante sur `loadMore` (fin de liste atteinte),
 * toutes les pages restantes sur `loadAll` (recherche), rechargement complet sur `refresh`.
 * `fetchPage` peut changer à chaque rendu : la dernière version est utilisée.
 */
export function usePaginatedList<T>(fetchPage: (page: number, pageSize: number) => Promise<PageResponse<T>>) {
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;
  const loaderRef = useRef<PageLoader<T> | null>(null);
  const [state, setState] = useState<PageLoaderState<T>>({
    items: [], count: null, loading: true, loadingMore: false, hasMore: true, error: null,
  });

  if (loaderRef.current === null) {
    loaderRef.current = new PageLoader<T>((page, pageSize) => fetchRef.current(page, pageSize), setState);
  }
  const loader = loaderRef.current;

  useEffect(() => {
    loader.refresh();
  }, [loader]);

  const refresh = useCallback(() => loader.refresh(), [loader]);
  const loadMore = useCallback(() => loader.loadMore(), [loader]);
  const retry = useCallback(() => loader.loadMore(true), [loader]);
  const loadAll = useCallback(() => loader.loadAll(), [loader]);

  return { ...state, refresh, loadMore, retry, loadAll };
}
