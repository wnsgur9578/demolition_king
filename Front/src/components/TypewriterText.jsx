import React, { useState, useEffect } from 'react';

function TypewriterText({ text = '', speed = 50, onDone }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) return;

    let i = 0;

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onDone]);

  return <p className="story-text">{displayedText}</p>;
}

export default TypewriterText;
