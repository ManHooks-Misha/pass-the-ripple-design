// WatercolorTypography.tsx
import React, { CSSProperties } from 'react';

// ==============================================
// TYPES & INTERFACES
// ==============================================

interface WatercolorTypographyProps {
  /** The text content (use \n for line breaks) */
  text: string;
  /** Font size (e.g., '2rem', '48px') */
  fontSize?: string;
  /** Font weight (300-1000) */
  fontWeight?: string | number;
  /** Array of colors for gradient */
  colors?: string[];
  /** Background color behind text */
  backgroundColor?: string;
  /** Shadow color for depth */
  shadowColor?: string;
  /** Padding around text */
  padding?: string;
  /** Margin around component */
  margin?: string;
  /** Line height */
  lineHeight?: string | number;
  /** Text alignment */
  textAlign?: CSSProperties['textAlign'];
  /** Maximum width */
  maxWidth?: string;
  /** Additional class names */
  className?: string;
  /** Enable hover animation */
  enableHoverAnimation?: boolean;
  /** Pooling effect intensity (0-1) */
  poolingEffect?: number;
}

// ==============================================
// COMPONENT
// ==============================================

const WatercolorTypography: React.FC<WatercolorTypographyProps> = ({
  text,
  fontSize = '2.5rem',
  fontWeight = '900',
  colors = ['#FF9EC0', '#8BC8FF', '#9DFFA2', '#FFD166'],
  backgroundColor = '#FFFFFF',
  shadowColor = 'rgba(0, 0, 0, 0.08)',
  padding = '1rem 1.5rem',
  margin = '0',
  lineHeight = '1.3',
  textAlign = 'center',
  maxWidth = '100%',
  className = '',
  enableHoverAnimation = true,
  poolingEffect = 0.5,
}) => {
  // ==============================================
  // STYLES
  // ==============================================
  
  const styles = `
    .watercolor-typography-${Math.random().toString(36).substr(2, 9)} {
      display: inline-block;
      position: relative;
      border-radius: 16px;
      overflow: visible;
      background-color: ${backgroundColor};
      padding: ${padding};
      margin: ${margin};
      max-width: ${maxWidth};
      text-align: ${textAlign};
      z-index: 1;
    }
    
    .watercolor-text {
      font-family: 'Arial Rounded MT Bold', 'Comic Sans MS', 
                   'Fredoka One', 'Nunito', 'Segoe UI', sans-serif;
      letter-spacing: 1.2px;
      position: relative;
      background: linear-gradient(135deg, ${colors.join(', ')});
      -webkit-background-clip: text;
      -moz-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 
        0 2px 4px ${shadowColor},
        0 4px 8px rgba(0, 0, 0, 0.05),
        0 8px 16px rgba(0, 0, 0, 0.03);
      z-index: 2;
      font-weight: ${fontWeight};
      font-size: ${fontSize};
      line-height: ${lineHeight};
      display: inline-block;
    }
    
    /* Watercolor texture overlay */
    .watercolor-text::before {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      background: linear-gradient(135deg, ${colors.join(', ')});
      background-clip: text;
      -webkit-background-clip: text;
      z-index: -1;
      filter: blur(8px) brightness(1.1);
      opacity: 0.4;
      border-radius: 20px;
    }
    
    /* Pooling effect at letter bottoms */
    .watercolor-text::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 10%;
      right: 10%;
      height: 4px;
      background: ${colors[colors.length - 1]};
      border-radius: 50%;
      opacity: ${poolingEffect * 0.4};
      filter: blur(3px);
      z-index: -1;
    }
    
    /* Individual letter effects */
    .watercolor-text span {
      display: inline-block;
      position: relative;
      margin: 0 1px;
    }
    
    .watercolor-text span::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 15%;
      right: 15%;
      height: 3px;
      background: ${colors[0]};
      border-radius: 50%;
      opacity: ${poolingEffect * 0.3};
      filter: blur(2px);
    }
    
    /* Watercolor blob background */
    .watercolor-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(20px);
      opacity: 0.2;
      z-index: 0;
      pointer-events: none;
    }
    
    /* Hover animation */
    ${enableHoverAnimation ? `
      .watercolor-text:hover {
        animation: watercolorSpread 1.5s ease-in-out infinite alternate;
      }
      
      @keyframes watercolorSpread {
        0% {
          filter: blur(0px) brightness(1);
          letter-spacing: 1.2px;
        }
        100% {
          filter: blur(1px) brightness(1.1);
          letter-spacing: 1.5px;
        }
      }
    ` : ''}
    
    /* Soft glow around entire component */
    .watercolor-container::before {
      content: '';
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      background: linear-gradient(135deg, ${colors.map(c => `${c}20`).join(', ')});
      border-radius: 24px;
      filter: blur(15px);
      opacity: 0.5;
      z-index: -2;
    }
  `;

  // ==============================================
  // UTILITY FUNCTIONS
  // ==============================================
  
  const generateUniqueId = () => `watercolor-typography-${Math.random().toString(36).substr(2, 9)}`;
  
  const generateBlobStyles = (index: number): CSSProperties => {
    const size = 60 + Math.random() * 80;
    const colorIndex = index % colors.length;
    
    return {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: colors[colorIndex],
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      transform: `translate(-50%, -50%)`,
    };
  };
  
  const createBlobs = () => {
    const blobCount = Math.min(colors.length, 4);
    return Array.from({ length: blobCount }).map((_, i) => (
      <div 
        key={`blob-${i}`}
        className="watercolor-blob"
        style={generateBlobStyles(i)}
      />
    ));
  };
  
  const renderText = () => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => (
      <React.Fragment key={`line-${lineIndex}`}>
        {line.split('').map((char, charIndex) => (
          <span key={`char-${lineIndex}-${charIndex}`}>
            {char}
          </span>
        ))}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // ==============================================
  // COMPONENT RENDER
  // ==============================================
  
  const componentId = generateUniqueId();
  const containerClasses = `watercolor-typography ${componentId} ${className}`.trim();

  return (
    <>
      <style>{styles}</style>
      
      <div className={`watercolor-container ${containerClasses}`}>
        {createBlobs()}
        <div className="watercolor-text">
          {renderText()}
        </div>
      </div>
    </>
  );
};

export default WatercolorTypography;