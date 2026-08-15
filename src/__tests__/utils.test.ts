import { cn } from "../lib/utils";


describe('cn helper function', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  });

  it('should handle conditional class names', () => {
    const isActive = true;
    expect(cn('bg-red-500', isActive && 'text-white')).toBe('bg-red-500 text-white')
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  });

  it('should handle falsy(false, null, undefined) values correctly', () => {
    expect(cn('bg-red-500', false &&'hidden', null, undefined, 'active')).toBe('bg-red-500 active')
  });

  it('should return an empty string when no classes are provided', () => {
    expect(cn()).toBe('')
  });
});