import { render, fireEvent, screen } from '@testing-library/react';
import ErrorPage from '../app/error';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

const mockError = {
  name: 'Test error name',
  message: 'Test error message',
  cause: 'Test error',
  digest: 'Test digest',
};

const reset = jest.fn();

describe('ErrorPage', () => {
  it('Error page is rendered correctly', async () => {
    render(<ErrorPage error={mockError} reset={reset} />);

    const title = await screen.findByText('Something went wrong');
    expect(title).toBeVisible();

    fireEvent.click(screen.getByText('Try again'));
    expect(reset).toHaveBeenCalled();
  });

  it('renders error page unchanged', () => {
    const { container } = render(<ErrorPage error={mockError} reset={reset} />);
    expect(container).toMatchSnapshot();
  });
});