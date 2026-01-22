import { renderHook, act } from '@testing-library/react';
import {
  useAppStore,
  useCollectionStore,
  useDeckBuilderStore,
  useCardSearchStore,
  useToastStore,
} from '../lib/store';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      theme: 'system',
      currency: 'EUR',
      language: 'de',
      sidebarOpen: true,
    });
  });

  it('should have default values', () => {
    const { result } = renderHook(() => useAppStore());

    expect(result.current.theme).toBe('system');
    expect(result.current.currency).toBe('EUR');
    expect(result.current.language).toBe('de');
  });

  it('should update theme', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });

  it('should toggle sidebar', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.sidebarOpen).toBe(false);
  });
});

describe('useCollectionStore', () => {
  beforeEach(() => {
    useCollectionStore.setState({
      selectedPortfolio: 'COLLECTION',
      filters: {
        condition: undefined,
        setCode: undefined,
        rarity: undefined,
      },
    });
  });

  it('should have default portfolio', () => {
    const { result } = renderHook(() => useCollectionStore());

    expect(result.current.selectedPortfolio).toBe('COLLECTION');
  });

  it('should update selected portfolio', () => {
    const { result } = renderHook(() => useCollectionStore());

    act(() => {
      result.current.setSelectedPortfolio('TRADES');
    });

    expect(result.current.selectedPortfolio).toBe('TRADES');
  });

  it('should update filters', () => {
    const { result } = renderHook(() => useCollectionStore());

    act(() => {
      result.current.setFilters({ condition: 'NEAR_MINT' });
    });

    expect(result.current.filters.condition).toBe('NEAR_MINT');
  });
});

describe('useDeckBuilderStore', () => {
  beforeEach(() => {
    useDeckBuilderStore.setState({
      mainDeck: [],
      extraDeck: [],
      sideDeck: [],
      currentDeck: null,
    });
  });

  it('should start with empty decks', () => {
    const { result } = renderHook(() => useDeckBuilderStore());

    expect(result.current.mainDeck).toHaveLength(0);
    expect(result.current.extraDeck).toHaveLength(0);
    expect(result.current.sideDeck).toHaveLength(0);
  });

  it('should add card to main deck', () => {
    const { result } = renderHook(() => useDeckBuilderStore());

    const mockCard = {
      id: 'p1',
      card: { id: 'c1', name: 'Dark Magician' },
    };

    act(() => {
      result.current.addToMainDeck(mockCard as any);
    });

    expect(result.current.mainDeck).toHaveLength(1);
    expect(result.current.mainDeck[0].quantity).toBe(1);
  });

  it('should increase quantity for existing card', () => {
    const { result } = renderHook(() => useDeckBuilderStore());

    const mockCard = {
      id: 'p1',
      card: { id: 'c1', name: 'Dark Magician' },
    };

    act(() => {
      result.current.addToMainDeck(mockCard as any);
      result.current.addToMainDeck(mockCard as any);
    });

    expect(result.current.mainDeck).toHaveLength(1);
    expect(result.current.mainDeck[0].quantity).toBe(2);
  });

  it('should not exceed 3 copies', () => {
    const { result } = renderHook(() => useDeckBuilderStore());

    const mockCard = {
      id: 'p1',
      card: { id: 'c1', name: 'Dark Magician' },
    };

    act(() => {
      result.current.addToMainDeck(mockCard as any);
      result.current.addToMainDeck(mockCard as any);
      result.current.addToMainDeck(mockCard as any);
      result.current.addToMainDeck(mockCard as any);
    });

    expect(result.current.mainDeck[0].quantity).toBe(3);
  });

  it('should remove card from main deck', () => {
    const { result } = renderHook(() => useDeckBuilderStore());

    const mockCard = {
      id: 'p1',
      card: { id: 'c1', name: 'Dark Magician' },
    };

    act(() => {
      result.current.addToMainDeck(mockCard as any);
      result.current.addToMainDeck(mockCard as any);
      result.current.removeFromMainDeck('p1');
    });

    expect(result.current.mainDeck[0].quantity).toBe(1);
  });

  it('should clear deck', () => {
    const { result } = renderHook(() => useDeckBuilderStore());

    const mockCard = {
      id: 'p1',
      card: { id: 'c1', name: 'Dark Magician' },
    };

    act(() => {
      result.current.addToMainDeck(mockCard as any);
      result.current.addToExtraDeck(mockCard as any);
      result.current.clearDeck();
    });

    expect(result.current.mainDeck).toHaveLength(0);
    expect(result.current.extraDeck).toHaveLength(0);
  });

  it('should calculate main deck count', () => {
    const { result } = renderHook(() => useDeckBuilderStore());

    const mockCard1 = { id: 'p1', card: { id: 'c1', name: 'Card 1' } };
    const mockCard2 = { id: 'p2', card: { id: 'c2', name: 'Card 2' } };

    act(() => {
      result.current.addToMainDeck(mockCard1 as any);
      result.current.addToMainDeck(mockCard1 as any);
      result.current.addToMainDeck(mockCard2 as any);
    });

    expect(result.current.mainDeckCount()).toBe(3);
  });
});

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('should add toast', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.addToast({
        title: 'Success',
        description: 'Operation completed',
        type: 'success',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Success');
  });

  it('should remove toast', () => {
    const { result } = renderHook(() => useToastStore());

    let toastId: string;

    act(() => {
      toastId = result.current.addToast({
        title: 'Test',
        type: 'info',
      });
    });

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});

describe('useCardSearchStore', () => {
  beforeEach(() => {
    useCardSearchStore.setState({
      query: '',
      filters: {},
      page: 1,
      limit: 20,
      viewMode: 'grid',
    });
  });

  it('should update query', () => {
    const { result } = renderHook(() => useCardSearchStore());

    act(() => {
      result.current.setQuery('Dark Magician');
    });

    expect(result.current.query).toBe('Dark Magician');
  });

  it('should update view mode', () => {
    const { result } = renderHook(() => useCardSearchStore());

    act(() => {
      result.current.setViewMode('list');
    });

    expect(result.current.viewMode).toBe('list');
  });

  it('should update page', () => {
    const { result } = renderHook(() => useCardSearchStore());

    act(() => {
      result.current.setPage(5);
    });

    expect(result.current.page).toBe(5);
  });

  it('should update filters', () => {
    const { result } = renderHook(() => useCardSearchStore());

    act(() => {
      result.current.setFilters({ type: 'Spell Card', attribute: 'DARK' });
    });

    expect(result.current.filters.type).toBe('Spell Card');
    expect(result.current.filters.attribute).toBe('DARK');
  });
});
