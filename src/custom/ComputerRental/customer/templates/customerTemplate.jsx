// customerTemplate.jsx

import React from 'react';

const customerTemplate = ({ data }) => {
  return (
    <div>
      <h3>customer Template</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default customerTemplate;
