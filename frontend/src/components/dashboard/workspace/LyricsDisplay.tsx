// src/components/lyrics/LyricsDisplay.tsx
import React, { useState, useEffect, useRef } from 'react';
import { LyricsManager } from './studio/visualizers/manager/LyricsManager';
import { LyricsState, LyricsDisplayConfig } from './studio/types/visualizer';

interface LyricsDisplayProps {
  lyricsManager: LyricsManager;
  className?: string;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ 
  lyricsManager, 
  className = '' 
}) => {
  const [lyricsState, setLyricsState] = useState<LyricsState>(lyricsManager.getCurrentState());
  const [config, setConfig] = useState<LyricsDisplayConfig>(lyricsManager.getConfig());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLyricsUpdate = (state: LyricsState) => {
      setLyricsState(state);
    };

    lyricsManager.onUpdate(handleLyricsUpdate);
    setConfig(lyricsManager.getConfig());

    return () => {
      lyricsManager.offUpdate(handleLyricsUpdate);
    };
  }, [lyricsManager]);

  const renderWordHighlight = (text: string, words: any[], currentWordIndex: number) => {
    if (!config.showWordHighlight || !words.length) {
      return <span>{text}</span>;
    }

    const elements: JSX.Element[] = [];
    let currentIndex = 0;

    words.forEach((word, index) => {
      // Add text before word
      if (word.start > currentIndex) {
        const beforeText = text.substring(currentIndex, word.start);
        if (beforeText.trim()) {
          elements.push(
            <span key={`before-${index}`} className="text-gray-400">
              {beforeText}
            </span>
          );
        }
      }

      // Add the word itself
      const isActive = index === currentWordIndex;
      elements.push(
        <span
          key={`word-${index}`}
          className={`transition-all duration-200 ${
            isActive 
              ? `text-${config.highlightColor} scale-110 font-bold` 
              : 'text-white'
          }`}
          style={{
            color: isActive ? config.highlightColor : config.color,
            transform: isActive ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {word.word}
        </span>
      );

      currentIndex = word.end;
    });

    // Add remaining text
    if (currentIndex < text.length) {
      const afterText = text.substring(currentIndex);
      if (afterText.trim()) {
        elements.push(
          <span key="after" className="text-gray-400">
            {afterText}
          </span>
        );
      }
    }

    return <>{elements}</>;
  };

  if (!lyricsState.isActive || !lyricsState.currentLine) {
    return null;
  }

  const formattedLine = lyricsManager.getFormattedLine();
  const upcomingLines = lyricsManager.getUpcomingLines(2);

  return (
    <div
      ref={containerRef}
      className={`absolute top-[700px] inset-0 pointer-events-none z-10 flex flex-col justify-center items-center ${className}`}
      style={{
        padding: '2rem',
        textAlign: config.textAlign,
        background: config.backgroundColor !== 'transparent' ? config.backgroundColor : undefined,
      }}
    >
      {/* Previous lines (faded) */}
      <div className="opacity-50 mb-4">
        {lyricsManager.getPreviousLines(1).map((line, index) => (
          <div
            key={`prev-${index}`}
            className="text-gray-400 text-lg mb-1"
            style={{ fontSize: config.fontSize * 0.8 }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Current line */}
      <div
        className={`mb-4 transition-all duration-300 ${
          config.showLineHighlight ? 'scale-105' : ''
        }`}
        style={{
          fontSize: `${config.fontSize}px`,
          color: config.color,
          transform: config.showLineHighlight ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {formattedLine ? (
          renderWordHighlight(formattedLine.text, formattedLine.words, lyricsState.currentWordIndex)
        ) : (
          <span>{lyricsState.currentLine}</span>
        )}
        
        {/* Progress bar for current line */}
        {/* <div
          className="h-1 bg-gray-600 mt-2 rounded-full overflow-hidden"
          style={{ width: '200px', margin: '8px auto 0' }}
        > */}
          {/* <div
            className="h-full bg-green-400 transition-all duration-100"
            style={{ width: `${lyricsState.progress * 100}%` }}
          /> */}
        {/* </div> */}
      </div>

      {/* Upcoming lines */}
      <div className="opacity-70 mt-4">
        {upcomingLines.map((line, index) => (
          <div
            key={`upcoming-${index}`}
            className="text-gray-300 text-lg mb-1"
            style={{ fontSize: config.fontSize * 0.8 }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};