// ComboSequence.jsx
import React from 'react';
import PoseIcon from './PoseIcon';

const ComboSequence = ({ comboList, matched }) => {
  return (
    <div className="combo-sequence">
      {comboList.map((pose, i) => (
        <PoseIcon key={i} type={pose} active={i >= matched} />
      ))}
    </div>
  );
};

export default ComboSequence;
