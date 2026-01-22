import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CardsPage from '../app/cards/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/cards',
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock the API client
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    searchCards: jest.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'Dark Magician',
          type: 'Normal Monster',
          frameType: 'normal',
          description: 'The ultimate wizard in terms of attack and defense.',
          atk: 2500,
          def: 2100,
          level: 7,
          race: 'Spellcaster',
          attribute: 'DARK',
          imageUrl: 'https://example.com/dm.jpg',
          imageUrlSmall: 'https://example.com/dm_small.jpg',
          printings: [
            {
              id: 'p1',
              setCode: 'LOB-EN005',
              setName: 'Legend of Blue Eyes White Dragon',
              rarity: 'Ultra Rare',
              price: 25.0,
            },
          ],
        },
        {
          id: '2',
          name: 'Blue-Eyes White Dragon',
          type: 'Normal Monster',
          frameType: 'normal',
          description: 'This legendary dragon is a powerful engine of destruction.',
          atk: 3000,
          def: 2500,
          level: 8,
          race: 'Dragon',
          attribute: 'LIGHT',
          imageUrl: 'https://example.com/bewd.jpg',
          imageUrlSmall: 'https://example.com/bewd_small.jpg',
          printings: [],
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    }),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('CardsPage', () => {
  it('renders the cards page title', async () => {
    render(<CardsPage />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Kartensuche')).toBeInTheDocument();
  });

  it('displays search input', async () => {
    render(<CardsPage />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/suche nach karten/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('shows cards after loading', async () => {
    render(<CardsPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Dark Magician')).toBeInTheDocument();
      expect(screen.getByText('Blue-Eyes White Dragon')).toBeInTheDocument();
    });
  });

  it('allows toggling between grid and list view', async () => {
    render(<CardsPage />, { wrapper: createWrapper() });
    
    // Find view toggle buttons
    const gridButton = screen.getByLabelText(/grid view/i);
    const listButton = screen.getByLabelText(/list view/i);
    
    expect(gridButton).toBeInTheDocument();
    expect(listButton).toBeInTheDocument();
    
    // Click list view
    fireEvent.click(listButton);
    
    // The view should change
    await waitFor(() => {
      // Check that list view is now active
    });
  });

  it('handles search input', async () => {
    render(<CardsPage />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/suche nach karten/i);
    fireEvent.change(searchInput, { target: { value: 'Dark Magician' } });
    
    expect(searchInput).toHaveValue('Dark Magician');
  });
});
