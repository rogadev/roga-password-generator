import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getParamsFromURL } from '../../src/utils/urlParams';

describe('urlParams', () => {
  // Store the original window.location
  let originalLocation;

  beforeEach(() => {
    // Save original location before tests
    originalLocation = window.location;
    
    // Mock window.location for testing
    // We need to delete first because location is a read-only property
    delete window.location;
    window.location = new URL('http://localhost:8080/');
  });

  afterEach(() => {
    // Restore original location after tests
    window.location = originalLocation;
    vi.clearAllMocks();
  });

  it('should return default settings when no URL parameters exist', () => {
    const settings = getParamsFromURL();
    expect(settings).toEqual({
      length: 20,
      excludeLowercase: false,
      excludeNumbers: false,
      excludeUppercase: false,
      excludeSymbols: false,
      excludedChars: '',
      ruleNoLeadingSpecial: false
    });
  });

  it('should parse length parameter correctly', () => {
    // Setup mock URL with length parameter
    window.location = new URL('http://localhost:8080/?len=24');
    
    const settings = getParamsFromURL();
    expect(settings.length).toBe(24);
  });

  it('should parse excluded character types correctly', () => {
    // Setup mock URL with excluded character types
    window.location = new URL('http://localhost:8080/?exLower&exNum');
    
    const settings = getParamsFromURL();
    expect(settings.excludeLowercase).toBe(true);
    expect(settings.excludeNumbers).toBe(true);
    expect(settings.excludeUppercase).toBe(false);
    expect(settings.excludeSymbols).toBe(false);
  });

  it('should parse excluded characters correctly', () => {
    // Setup mock URL with excluded characters
    window.location = new URL('http://localhost:8080/?exc=abc123');
    
    const settings = getParamsFromURL();
    expect(settings.excludedChars).toBe('abc123');
  });

  it('should decode URL-encoded excluded characters', () => {
    // Setup mock URL with URL-encoded characters
    window.location = new URL('http://localhost:8080/?exc=%40%23%24');
    
    const settings = getParamsFromURL();
    expect(settings.excludedChars).toBe('@#$');
  });

  it('should parse rules correctly', () => {
    // Setup mock URL with rule
    window.location = new URL('http://localhost:8080/?ruleNoLead');
    
    const settings = getParamsFromURL();
    expect(settings.ruleNoLeadingSpecial).toBe(true);
  });

  it('should handle combined parameters correctly', () => {
    // Setup mock URL with multiple parameters
    window.location = new URL('http://localhost:8080/?len=18&exUpper&exSym&ruleNoLead&exc=xyz789');
    
    const settings = getParamsFromURL();
    expect(settings.length).toBe(18);
    expect(settings.excludeUppercase).toBe(true);
    expect(settings.excludeSymbols).toBe(true);
    expect(settings.excludeLowercase).toBe(false);
    expect(settings.excludeNumbers).toBe(false);
    expect(settings.ruleNoLeadingSpecial).toBe(true);
    expect(settings.excludedChars).toBe('xyz789');
  });
}); 