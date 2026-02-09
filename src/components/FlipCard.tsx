import React, { useState } from "react";
import atSchool from "@/assets/hero-wall/public/at-school.png";
import atHome from "@/assets/hero-wall/public/at-home.png";
import myCommunity from "@/assets/hero-wall/public/in-my-community.png";
import myClassRoom from "@/assets/hero-wall/public/in-my-classroom.png";
import everyWhere from "@/assets/hero-wall/public/everywhere-else.png";
import challenges from "@/assets/hero-wall/public/challenges.png";

interface FlipCardProps {
  id: string;
  title: string;
  stat: string;
  description: string;
  image: string;
  date: string;
  rippleId: string;
  category: string;
  onNavigate?: () => void;
}

const categoryIcons: Record<string, string> = {
  "At School": atSchool,
  "At Home": atHome,
  "In My Community": myCommunity,
  "In My Classroom": myClassRoom,
  "Challenges": challenges,
  "Everywhere Else": everyWhere,
};

const FlipCard: React.FC<FlipCardProps> = ({
  id,
  title,
  stat,
  description,
  image,
  date,
  rippleId,
  category,
  onNavigate,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
  };

  const handleBackTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate();
    }
  };

  // Helper function to remove HTML tags
  const stripHtmlTags = (html: string): string => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Helper function to truncate text to character limit
  const truncateText = (text: string, maxLength: number = 200): string => {
    const cleanText = stripHtmlTags(text);
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength).trim() + '...';
  };

  const categoryIcon = categoryIcons[category] || atSchool;

  // Clean and truncate description for back view
  const cleanDescription = truncateText(description, 250);

  // Debug: Log image path
  // console.log('FlipCard image:', image, 'Category:', category, 'CategoryIcon:', categoryIcon);

  return (
    <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
      <div className="flip-card-inner">
        {/* Front Side - Exactly like existing ripple-card */}
        <div className="flip-card-front ripple-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
          <div className="ripple-card-header">
            <span className="ripple-card-date">{date}</span>
          </div>

          <div className="ripple-card-image-wrapper">
            <img
              src={image}
              alt={title}
              className="ripple-card-image"
              onError={(e) => {
                console.error('Image failed to load:', image);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => console.log('Image loaded successfully:', image)}
            />
          </div>

          <h4 className="ripple-card-title">
            {title}
          </h4>

          <p className="ripple-card-stat">
            {stat}
          </p>

          <button className="ripple-card-flip-btn">Click to flip the card</button>

          <div className="ripple-card-footer">
            <span className="ripple-card-id">Ripple ID: {rippleId}</span>
          </div>
        </div>

        {/* Back Side */}
        <div className="flip-card-back" onClick={handleBackClick}>
          <div className="flip-card-back-header">
            <span className="flip-card-back-date">{date}</span>
          </div>

          <div className="flip-card-back-content">
            <h3
              className="flip-card-back-title"
              onClick={handleBackTitleClick}
              style={{ cursor: onNavigate ? 'pointer' : 'default' }}
            >
              {title}
            </h3>

            <p className="flip-card-back-description">{cleanDescription}</p>

            <div className="flip-card-back-footer">
              <div className="flip-card-category">
                <img
                  src={categoryIcon}
                  alt={category}
                  className="flip-card-category-icon"
                />
                {/* <span className="flip-card-category-text">{category}</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
