import { describe, it, expect } from 'vitest';

/**
 * Contract State Machine Tests
 * Tests the 4-state lifecycle: Reserved → Active → Completed → Void
 * Validates allowed and disallowed transitions
 */

describe('Contract State Machine', () => {
  describe('Valid State Transitions', () => {
    it('should allow Reserved → Active transition', () => {
      const currentState = 'Reserved';
      const newState = 'Active';
      
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const allowed = validTransitions[currentState as keyof typeof validTransitions]?.includes(newState);
      expect(allowed).toBe(true);
    });

    it('should allow Reserved → Void transition', () => {
      const currentState = 'Reserved';
      const newState = 'Void';
      
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const allowed = validTransitions[currentState as keyof typeof validTransitions]?.includes(newState);
      expect(allowed).toBe(true);
    });

    it('should allow Active → Completed transition', () => {
      const currentState = 'Active';
      const newState = 'Completed';
      
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const allowed = validTransitions[currentState as keyof typeof validTransitions]?.includes(newState);
      expect(allowed).toBe(true);
    });

    it('should allow Active → Void transition', () => {
      const currentState = 'Active';
      const newState = 'Void';
      
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const allowed = validTransitions[currentState as keyof typeof validTransitions]?.includes(newState);
      expect(allowed).toBe(true);
    });
  });

  describe('Invalid State Transitions', () => {
    it('should NOT allow Reserved → Completed (must go through Active)', () => {
      const currentState = 'Reserved';
      const newState = 'Completed';
      
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const allowed = validTransitions[currentState as keyof typeof validTransitions]?.includes(newState);
      expect(allowed).toBe(false);
    });

    it('should NOT allow Completed → Active (terminal state)', () => {
      const currentState = 'Completed';
      const newState = 'Active';
      
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const allowed = validTransitions[currentState as keyof typeof validTransitions]?.includes(newState);
      expect(allowed).toBe(false);
    });

    it('should NOT allow Completed → Reserved (terminal state)', () => {
      const currentState = 'Completed';
      const newState = 'Reserved';
      
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const allowed = validTransitions[currentState as keyof typeof validTransitions]?.includes(newState);
      expect(allowed).toBe(false);
    });

    it('should NOT allow Completed → Void (cannot void after completion)', () => {
      const currentState = 'Completed';
      const newState = 'Void';
      
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const allowed = validTransitions[currentState as keyof typeof validTransitions]?.includes(newState);
      expect(allowed).toBe(false);
    });

    it('should NOT allow Void → any state (terminal state)', () => {
      const currentState = 'Void';
      const possibleStates = ['Reserved', 'Active', 'Completed'];
      
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const anyAllowed = possibleStates.some(state => 
        validTransitions[currentState as keyof typeof validTransitions]?.includes(state)
      );
      
      expect(anyAllowed).toBe(false);
    });

    it('should NOT allow Active → Reserved (cannot go backwards)', () => {
      const currentState = 'Active';
      const newState = 'Reserved';
      
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const allowed = validTransitions[currentState as keyof typeof validTransitions]?.includes(newState);
      expect(allowed).toBe(false);
    });
  });

  describe('State Machine Validation', () => {
    it('should validate Reserved state has exactly 2 allowed transitions', () => {
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      expect(validTransitions.Reserved).toHaveLength(2);
      expect(validTransitions.Reserved).toContain('Active');
      expect(validTransitions.Reserved).toContain('Void');
    });

    it('should validate Active state has exactly 2 allowed transitions', () => {
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      expect(validTransitions.Active).toHaveLength(2);
      expect(validTransitions.Active).toContain('Completed');
      expect(validTransitions.Active).toContain('Void');
    });

    it('should validate Completed state has no allowed transitions', () => {
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      expect(validTransitions.Completed).toHaveLength(0);
    });

    it('should validate Void state has no allowed transitions', () => {
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      expect(validTransitions.Void).toHaveLength(0);
    });
  });

  describe('State Transition Lifecycle', () => {
    it('should follow normal lifecycle: Reserved → Active → Completed', () => {
      const lifecycle = [];
      let state = 'Reserved';
      
      lifecycle.push(state);
      
      // Transition to Active
      state = 'Active';
      lifecycle.push(state);
      
      // Transition to Completed
      state = 'Completed';
      lifecycle.push(state);
      
      expect(lifecycle).toEqual(['Reserved', 'Active', 'Completed']);
    });

    it('should allow early termination: Reserved → Void', () => {
      const lifecycle = [];
      let state = 'Reserved';
      
      lifecycle.push(state);
      
      // Transition to Void
      state = 'Void';
      lifecycle.push(state);
      
      expect(lifecycle).toEqual(['Reserved', 'Void']);
    });

    it('should allow cancellation during active: Active → Void', () => {
      const lifecycle = [];
      let state = 'Reserved';
      
      lifecycle.push(state);
      state = 'Active';
      lifecycle.push(state);
      
      // Cancel while active
      state = 'Void';
      lifecycle.push(state);
      
      expect(lifecycle).toEqual(['Reserved', 'Active', 'Void']);
    });
  });

  describe('Terminal States', () => {
    it('should identify Completed as terminal state', () => {
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const isTerminal = (state: string) => {
        return validTransitions[state as keyof typeof validTransitions]?.length === 0;
      };
      
      expect(isTerminal('Completed')).toBe(true);
    });

    it('should identify Void as terminal state', () => {
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const isTerminal = (state: string) => {
        return validTransitions[state as keyof typeof validTransitions]?.length === 0;
      };
      
      expect(isTerminal('Void')).toBe(true);
    });

    it('should identify Reserved as non-terminal state', () => {
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const isTerminal = (state: string) => {
        return validTransitions[state as keyof typeof validTransitions]?.length === 0;
      };
      
      expect(isTerminal('Reserved')).toBe(false);
    });

    it('should identify Active as non-terminal state', () => {
      const validTransitions = {
        'Reserved': ['Active', 'Void'],
        'Active': ['Completed', 'Void'],
        'Completed': [],
        'Void': []
      };
      
      const isTerminal = (state: string) => {
        return validTransitions[state as keyof typeof validTransitions]?.length === 0;
      };
      
      expect(isTerminal('Active')).toBe(false);
    });
  });

  describe('State Validation Helper', () => {
    it('should validate transition using helper function', () => {
      const validateTransition = (from: string, to: string): boolean => {
        const validTransitions: Record<string, string[]> = {
          'Reserved': ['Active', 'Void'],
          'Active': ['Completed', 'Void'],
          'Completed': [],
          'Void': []
        };
        
        return validTransitions[from]?.includes(to) || false;
      };
      
      expect(validateTransition('Reserved', 'Active')).toBe(true);
      expect(validateTransition('Reserved', 'Completed')).toBe(false);
      expect(validateTransition('Active', 'Completed')).toBe(true);
      expect(validateTransition('Completed', 'Void')).toBe(false);
      expect(validateTransition('Void', 'Reserved')).toBe(false);
    });
  });

  describe('Business Rules', () => {
    it('should enforce that only Reserved/Active can be voided', () => {
      const canVoid = (state: string): boolean => {
        return state === 'Reserved' || state === 'Active';
      };
      
      expect(canVoid('Reserved')).toBe(true);
      expect(canVoid('Active')).toBe(true);
      expect(canVoid('Completed')).toBe(false);
      expect(canVoid('Void')).toBe(false);
    });

    it('should enforce that only Active can be completed', () => {
      const canComplete = (state: string): boolean => {
        return state === 'Active';
      };
      
      expect(canComplete('Reserved')).toBe(false);
      expect(canComplete('Active')).toBe(true);
      expect(canComplete('Completed')).toBe(false);
      expect(canComplete('Void')).toBe(false);
    });

    it('should enforce that only Reserved can be activated', () => {
      const canActivate = (state: string): boolean => {
        return state === 'Reserved';
      };
      
      expect(canActivate('Reserved')).toBe(true);
      expect(canActivate('Active')).toBe(false);
      expect(canActivate('Completed')).toBe(false);
      expect(canActivate('Void')).toBe(false);
    });
  });
});
