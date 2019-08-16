import React from 'react';

const StickyContext = React.createContext(
  {
    subscribe: () => {},
    unsubscribe: () => {},
    getParent: () => {}

  }
);

export default StickyContext;
