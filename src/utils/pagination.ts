/**
 * Listes paginées des API (SIG, DCC) : le serveur renvoie au plus 100 éléments par page
 * ({count, next, previous, results}), le mobile charge la page suivante quand on approche de la fin de la liste.
 * Logique sans React (testée sous Node) ; le hook usePaginatedList l'expose aux écrans.
 */

/** Réponse d'une page : celle de l'API, ou {error} (réseau, serveur) renvoyé par les services. */
export type PageResponse<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  error?: any;
  [key: string]: any;
};

export type PageLoaderState<T> = {
  items: T[];
  /** Nombre total d'éléments annoncé par le serveur (null tant qu'aucune page n'est chargée). */
  count: number | null;
  /** Première page en cours de chargement (écran vide). */
  loading: boolean;
  /** Page suivante en cours de chargement. */
  loadingMore: boolean;
  hasMore: boolean;
  /** Dernière erreur (page non chargée) ; les éléments déjà chargés restent affichés. */
  error: any;
};

/** Nombre d'éléments demandés par page (plafond du serveur : max_page_size = 100). */
export const PAGE_SIZE = 100;

export class PageLoader<T> {
  private state: PageLoaderState<T> = {
    items: [], count: null, loading: false, loadingMore: false, hasMore: true, error: null,
  };
  private nextPage = 1;
  private inFlight: Promise<void> | null = null;
  // Incrémenté à chaque rechargement : la réponse d'une page demandée avant est ignorée.
  private generation = 0;

  constructor(
    private fetchPage: (page: number, pageSize: number) => Promise<PageResponse<T>>,
    private onChange: (state: PageLoaderState<T>) => void = () => undefined,
  ) {}

  getState(): PageLoaderState<T> {
    return this.state;
  }

  private update(patch: Partial<PageLoaderState<T>>) {
    this.state = { ...this.state, ...patch };
    this.onChange(this.state);
  }

  /** Recharge depuis la première page (ouverture de l'écran, « tirer pour actualiser »). */
  refresh(): Promise<void> {
    this.generation += 1;
    this.nextPage = 1;
    this.inFlight = null;
    this.update({ items: [], count: null, hasMore: true, error: null, loading: true, loadingMore: false });
    return this.loadMore();
  }

  /** Page suivante, sauf si une page est déjà en cours ou s'il n'y en a plus. Après une erreur (hors connexion...),
   * le défilement ne relance pas la page : seulement `retry` (bouton « Réessayer ») ou un rechargement. */
  loadMore(retry = false): Promise<void> {
    if (this.inFlight) return this.inFlight;
    if (!this.state.hasMore || (this.state.error && !retry)) return Promise.resolve();
    const generation = this.generation;
    const page = this.nextPage;
    if (page > 1) this.update({ loadingMore: true, error: null });
    const run = (async () => {
      let response: PageResponse<T>;
      try {
        response = await this.fetchPage(page, PAGE_SIZE);
      } catch (error) {
        response = { error };
      }
      if (generation !== this.generation) return; // rechargé entre-temps
      if (!response || response.error || !Array.isArray(response.results)) {
        this.update({ loading: false, loadingMore: false, error: response?.error ?? response ?? 'invalid_response' });
        return;
      }
      const items = page === 1 ? response.results : [...this.state.items, ...response.results];
      this.nextPage = page + 1;
      this.update({
        items,
        count: typeof response.count === 'number' ? response.count : items.length,
        // `next` du serveur ; à défaut, une page pleine laisse supposer une suite
        hasMore: response.next !== undefined ? !!response.next : response.results.length >= PAGE_SIZE,
        loading: false,
        loadingMore: false,
        error: null,
      });
    })();
    this.inFlight = run;
    return run.finally(() => {
      if (this.inFlight === run) this.inFlight = null;
    });
  }

  /** Toutes les pages restantes (recherche dans la liste : elle doit porter sur tous les éléments). */
  async loadAll(maxPages = 200): Promise<void> {
    for (let i = 0; i < maxPages && this.state.hasMore && !this.state.error; i += 1) {
      await this.loadMore();
    }
  }
}

/**
 * Toutes les pages d'une liste, réunies dans la réponse de la première page (listes de choix : villages, cantons...).
 * Une page en erreur : la réponse d'erreur est renvoyée telle quelle.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<PageResponse<T>>,
  maxPages = 200,
): Promise<PageResponse<T>> {
  const first = await fetchPage(1, PAGE_SIZE);
  if (!first || first.error || !Array.isArray(first.results)) return first;
  const results = [...first.results];
  let next = first.next;
  for (let page = 2; next && page <= maxPages; page += 1) {
    const response = await fetchPage(page, PAGE_SIZE);
    if (!response || response.error || !Array.isArray(response.results)) return response;
    results.push(...response.results);
    next = response.next;
  }
  return { ...first, next: null, results };
}

/** Défilement proche de la fin du contenu (événement onScroll d'un ScrollView). */
export function isCloseToBottom(
  nativeEvent: { layoutMeasurement: { height: number }; contentOffset: { y: number }; contentSize: { height: number } },
  threshold = 600,
): boolean {
  const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold;
}
