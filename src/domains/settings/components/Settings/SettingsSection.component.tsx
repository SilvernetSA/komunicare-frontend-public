import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import './Settings.css';

interface SettingItem {
  text: { id: string; defaultMessage: string } | string;
  icon: React.ReactNode;
  url?: string;
  onClick?: () => void;
  secondary?: React.ReactNode;
  rightContent?: React.ReactNode;
  color?: string;
}

interface SettingsSectionProps {
  subheader: { id: string; defaultMessage: string };
  settings?: SettingItem[];
  layout?: 'card' | 'row';
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  subheader,
  settings = [],
  layout = 'card',
}) => {
  const renderLabel = (text: SettingItem['text']) =>
    typeof text === 'string' ? text : <FormattedMessage {...text} />;

  const itemId = (text: SettingItem['text']) =>
    typeof text === 'string' ? text : text.defaultMessage;

  if (layout === 'row') {
    return (
      <section className="Settings__section-wrapper">
        <h3 className="Settings__section-header">
          <FormattedMessage {...subheader} />
        </h3>
        <div className="Settings__row-list">
          {settings.map((item, index) => {
            const inner = (
              <div className="Settings__row-card" id={itemId(item.text)}>
                <div
                  className="Settings__row-icon"
                  style={{ backgroundColor: item.color ?? '#5C6BC0' }}
                >
                  {item.icon}
                </div>
                <div className="Settings__row-info">
                  <span className="Settings__row-name">
                    {renderLabel(item.text)}
                  </span>
                  {item.secondary && (
                    <span className="Settings__row-secondary">
                      {item.secondary}
                    </span>
                  )}
                </div>
                {item.rightContent && (
                  <div className="Settings__row-action">
                    {item.rightContent}
                  </div>
                )}
              </div>
            );

            if (item.url) {
              return (
                <Link key={index} to={item.url} className="Settings__item-link">
                  {inner}
                </Link>
              );
            }
            return (
              <div
                key={index}
                className="Settings__item-link"
                onClick={item.onClick}
                style={{ cursor: item.onClick ? 'pointer' : 'default' }}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="Settings__section-wrapper">
      <h3 className="Settings__section-header">
        <FormattedMessage {...subheader} />
      </h3>
      <div className="Settings__card-grid">
        {settings.map((item, index) => {
          const inner = (
            <div className="Settings__card" id={itemId(item.text)}>
              <div
                className="Settings__card-icon"
                style={{ backgroundColor: item.color ?? '#1976D2' }}
              >
                {item.icon}
              </div>
              <span className="Settings__card-label">
                {renderLabel(item.text)}
              </span>
            </div>
          );

          if (item.url) {
            return (
              <Link key={index} to={item.url} className="Settings__card-link">
                {inner}
              </Link>
            );
          }
          return (
            <div
              key={index}
              className="Settings__card-link"
              onClick={item.onClick}
              style={{ cursor: 'pointer' }}
            >
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SettingsSection;
