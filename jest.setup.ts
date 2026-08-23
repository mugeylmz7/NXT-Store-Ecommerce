import '@testing-library/jest-dom';

// Global fetch tanımı (Node.js/Jest ortamı için)
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
) as jest.Mock;


jest.mock('@/lib/stripe', () => ({
  stripe: {},
}));