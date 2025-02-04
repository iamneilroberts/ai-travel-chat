export const formatError = (error: unknown): string | null => {
  try {
    // Handle specific error patterns
    if (error === 'Object: Object' || 
        (error && typeof error === 'object' && Object.keys(error).length === 0) ||
        (error && typeof error === 'object' && error.toString() === '[object Object]')) {
      return null; // Silently handle empty object errors
    }
    
    // Handle JSHandle errors silently
    if (error && typeof error === 'object' && 
        (error.constructor?.name === 'JSHandle' || 
         String(error).includes('JSHandle@object'))) {
      return null;
    }

    // Handle cancellation errors silently
    if (error && typeof error === 'object' && 'type' in error && error.type === 'cancellation') {
      return null;
    }

    // Handle Puppeteer errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = String(error.message);
      if (errorMessage.includes('Target closed') || errorMessage.includes('Session closed')) {
        return null; // Handle browser session errors silently
      }
    }

    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    
    if (error && typeof error === 'object') {
      // Handle circular references and special objects
      const seen = new WeakSet();
      const stringified = JSON.stringify(error, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          // Handle Puppeteer JSHandle objects
          if (value.constructor?.name === 'JSHandle') {
            return null;
          }
          
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
          
          if (value instanceof Error) {
            return value.message;
          }
        }
        return value;
      }, 2);
      
      return stringified || null;
    }
    
    return String(error) || null;
  } catch {
    return 'An unknown error occurred while formatting error message';
  }
};

export const handleBrowserError = (error: unknown): boolean => {
  try {
    // Handle cancellation
    if (error && typeof error === 'object' && 'type' in error && error.type === 'cancellation') {
      console.log('Operation cancelled');
      return true;
    }

    // Handle JSHandle errors
    if (error && typeof error === 'object') {
      // Check for JSHandle constructor or JSHandle@object string
      if (error.constructor?.name === 'JSHandle' || 
          String(error).includes('JSHandle@object') ||
          (error.toString && error.toString() === '[object Object]')) {
        console.log('Browser action completed');
        return true;
      }

      // Check for browser session errors
      if ('message' in error) {
        const message = String(error.message);
        if (message.includes('Target closed') || message.includes('Session closed')) {
          console.log('Browser session ended');
          return true;
        }
      }

      // Check for Puppeteer-specific errors
      if ('_remoteObject' in error || '_client' in error) {
        console.log('Browser operation completed');
        return true;
      }
    }

    return false;
  } catch (e) {
    // If we get an error while checking the error, assume it's a browser error
    console.log('Error while handling browser error:', e);
    return true;
  }
};

export const useErrorHandlers = (
  setPageError: (error: Error | null) => void,
  setCommandError: (error: string | null) => void
) => {
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    try {
      // Check if this is a browser-specific error we want to handle silently
      if (handleBrowserError(event.reason)) {
        event.preventDefault();
        return;
      }

      // Handle cancellation errors silently
      if (event.reason && typeof event.reason === 'object' && 'type' in event.reason && event.reason.type === 'cancellation') {
        console.log('Operation cancelled');
        event.preventDefault();
        return;
      }

      console.error('Unhandled promise rejection:', event.reason);
      setPageError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      event.preventDefault();
    } catch (e) {
      // If we get an error while handling the rejection, log it but don't crash
      console.error('Error handling rejection:', e);
      event.preventDefault();
    }
  };

  const handleError = (event: ErrorEvent) => {
    console.error('Page error:', event.error);
    const error = event.error || new Error('An unknown error occurred');
    const formattedError = formatError(error);
    if (formattedError) { // Only set error if it's not meant to be handled silently
      setPageError(new Error(formattedError));
    }
    event.preventDefault();
  };

  const handlePromiseError = (event: PromiseRejectionEvent) => {
    // Handle cancellation errors silently
    if (event.reason && typeof event.reason === 'object' && 'type' in event.reason && event.reason.type === 'cancellation') {
      console.log('Operation cancelled');
      event.preventDefault();
      return;
    }

    // Check if this is a browser-specific error we want to handle silently
    if (handleBrowserError(event.reason)) {
      event.preventDefault();
      return;
    }

    console.error('Promise error:', event.reason);
    const formattedError = formatError(event.reason);
    if (formattedError) { // Only set error if it's not meant to be handled silently
      setPageError(new Error(formattedError));
    }
    event.preventDefault();
  };

  return {
    handleUnhandledRejection,
    handleError,
    handlePromiseError
  };
};
