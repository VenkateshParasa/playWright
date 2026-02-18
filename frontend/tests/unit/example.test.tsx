import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Example component test utility
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui);
}

// Example test to demonstrate setup
describe('Testing Library Setup', () => {
  it('should work correctly', () => {
    const { container } = render(<div>Hello World</div>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
