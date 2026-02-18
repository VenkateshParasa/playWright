import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock component for testing
const TestComponent = () => {
  return (
    <div>
      <h1>Test Component</h1>
      <button>Click Me</button>
    </div>
  );
};

describe('Integration Tests Example', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('should render component with React Query', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const handleClick = vi.fn();

    const InteractiveComponent = () => (
      <button onClick={handleClick}>Click Me</button>
    );

    render(<InteractiveComponent />);

    const button = screen.getByText('Click Me');
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should handle async operations', async () => {
    const AsyncComponent = () => {
      const [data, setData] = React.useState<string | null>(null);

      React.useEffect(() => {
        setTimeout(() => setData('Loaded'), 100);
      }, []);

      return <div>{data || 'Loading...'}</div>;
    };

    render(<AsyncComponent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Loaded')).toBeInTheDocument();
    });
  });
});

// Mock API integration test
describe('API Integration', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  it('should fetch data from API', async () => {
    const mockData = { id: 1, name: 'Test' };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const response = await fetch('/api/test');
    const data = await response.json();

    expect(data).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('/api/test');
  });

  it('should handle API errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(fetch('/api/test')).rejects.toThrow('Network error');
  });
});
