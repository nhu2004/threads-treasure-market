import React from 'react';

const PreviewImage = ({ src, alt }) => {
  return (
    <div>
      <img src={src} alt={alt || 'Preview'} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};

export default PreviewImage;