import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../app/page';

// Mock the API client
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    getCollectionStats: jest.fn().mockResolvedValue({
      totalCards: 150,
      totalValue: 1250.5,
      uniqueCards: 75,
      byPortfolio: {
        COLLECTION: 120,
        TRADES: 20,
        BULK: 10,
      },
    }),
    getCollection: jest.fn().mockResolvedValue([
      {
        id: '1',
        quantity: 3,
        printing: {
          price: 25.0,
          card: {
            name: 'Dark Magician',
            imageUrlSmall: 'https://example.com/dm.jpg',
          },
        },
      },
    ]),
    getDecks: jest.fn().mockResolvedValue([]),
  },
}));

// Create a wrapper for tests
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

describe('Dashboard', () => {
  it('renders the dashboard title', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays collection stats', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Gesamte Karten')).toBeInTheDocument();
    });
  });

  it('shows quick actions section', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Schnellaktionen')).toBeInTheDocument();
    expect(screen.getByText('Karte suchen')).toBeInTheDocument();
    expect(screen.getByText('Zur Sammlung')).toBeInTheDocument();
  });
});
