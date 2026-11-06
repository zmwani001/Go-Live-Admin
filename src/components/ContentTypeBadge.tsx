/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Globe, Presentation, Sparkles, Smartphone, LayoutDashboard } from 'lucide-react';
import { ContentType, CONTENT_TYPE_CONFIG } from '../config/constants';

interface ContentTypeIconProps {
  type: ContentType;
  className?: string;
  size?: number;
}

export const ContentTypeIcon: React.FC<ContentTypeIconProps> = ({
  type,
  className = '',
  size = 16,
}) => {
  switch (type) {
    case 'landing':
      return <Globe size={size} className={className} style={{ color: CONTENT_TYPE_CONFIG.landing.color }} />;
    case 'deck':
      return <Presentation size={size} className={className} style={{ color: CONTENT_TYPE_CONFIG.deck.color }} />;
    case 'poster':
      return <Sparkles size={size} className={className} style={{ color: CONTENT_TYPE_CONFIG.poster.color }} />;
    case 'mobile':
      return <Smartphone size={size} className={className} style={{ color: CONTENT_TYPE_CONFIG.mobile.color }} />;
    case 'dashboard':
      return <LayoutDashboard size={size} className={className} style={{ color: CONTENT_TYPE_CONFIG.dashboard.color }} />;
    default:
      return <Globe size={size} className={className} />;
  }
};

interface ContentTypeBadgeProps {
  type: ContentType;
  showIcon?: boolean;
  className?: string;
}

export const ContentTypeBadge: React.FC<ContentTypeBadgeProps> = ({
  type,
  showIcon = true,
  className = '',
}) => {
  const config = CONTENT_TYPE_CONFIG[type] || CONTENT_TYPE_CONFIG.landing;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium border select-none ${className}`}
      style={{
        backgroundColor: config.badgeBg,
        borderColor: config.badgeBorder,
        color: config.badgeText,
      }}
    >
      {showIcon && <ContentTypeIcon type={type} size={13} />}
      <span>{config.label}</span>
    </span>
  );
};
