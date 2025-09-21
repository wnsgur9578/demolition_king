// components/PoseIcon.jsx
import React from 'react';
import punchImg from '../../assets/images/singlemode/punch.png';
import upperImg from '../../assets/images/singlemode/upper.png';
import dodgeImg from '../../assets/images/singlemode/dodge.png';

const typeToImage = {
  잽: punchImg,
  어퍼: upperImg,
  회피: dodgeImg,
};

const PoseIcon = ({ type, active }) => {
  return (
    <img
      src={typeToImage[type]}
      alt={type}
      className={`pose-icon ${active ? 'active' : 'inactive'}`}
    />
  );
};

export default PoseIcon;
