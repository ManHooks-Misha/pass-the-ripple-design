import React from "react";
import "../../styles/components/_info-card.scss";

interface InfoCardProps {
  borderColor: string;
  backgroundColor: string;
  children: React.ReactNode; // This allows passing elements inside the component
}

const InfoCard: React.FC<InfoCardProps> = ({
  borderColor,
  backgroundColor,
  children,
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor,
    border: `15px solid ${borderColor}`,
    // 🔑 VERY IMPORTANT
  };

  return <div className="info-card-main" style={cardStyle}>{children}</div>;
};


export default InfoCard;