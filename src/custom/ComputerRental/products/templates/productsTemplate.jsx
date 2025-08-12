// productsTemplate.jsx

import React from 'react';

const productsTemplate = ({ data }) => {
  return (
    <div>
      <h3>products Template</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default productsTemplate;
