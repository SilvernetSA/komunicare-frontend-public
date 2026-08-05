import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Joyride, { STATUS } from 'react-joyride';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import messages from './Settings.messages';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './SettingsTour.css';

interface SettingsTourProps {
  isSettingsTourEnabled: boolean;
  disableTour: (data: { isSettingsTourEnabled: boolean }) => void;
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
}

interface TooltipSwiperText {
  title: string | React.ReactElement;
  description: string | React.ReactElement;
}

interface TourImage {
  src: string;
  description: { id: string; defaultMessage: string };
  title: { id: string; defaultMessage: string };
}

interface TourImages {
  display: TourImage[];
  scanning: TourImage[];
  navigation: TourImage[];
}

const joyrideStyles = {
  options: {
    arrowColor: '#ffffff',
    backgroundColor: '#ffffff',
    primaryColor: '#0084c8',
    textColor: '#1a2640',
    width: 520,
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0, 132, 200, 0.15)',
    padding: '28px 32px',
  },
  tooltipTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1a2640',
    marginBottom: 8,
  },
  tooltipContent: {
    fontSize: '1rem',
    color: '#3d5068',
    lineHeight: 1.6,
    padding: '0',
  },
  buttonNext: {
    backgroundColor: '#0084c8',
    borderRadius: 8,
    fontSize: '0.95rem',
    fontWeight: 600,
    padding: '10px 24px',
  },
  buttonBack: {
    color: '#0084c8',
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  buttonSkip: {
    color: '#6b7f96',
    fontSize: '0.9rem',
  },
  beaconInner: {
    backgroundColor: '#0084c8',
  },
  beaconOuter: {
    borderColor: '#b3d9f0',
    backgroundColor: 'rgba(0, 132, 200, 0.2)',
  },
};

const imgFolderPath = '../../../images/tour/settingsTour/';
const settingsTourImages: TourImages = {
  display: [
    {
      src: imgFolderPath + 'elementsSize.png',
      description: messages.uiSizeDescrip,
      title: messages.uiSizeTitle,
    },
    {
      src: imgFolderPath + 'fontSize.png',
      description: messages.fontSizeDescrip,
      title: messages.fontSizeTitle,
    },
    {
      src: imgFolderPath + 'hideTheOutputBarOpt.png',
      description: messages.hideOutputBarDescrip,
      title: messages.hideOutputBarTitle,
    },
    {
      src: imgFolderPath + 'labelPosition.png',
      description: messages.labelPositionDescrip,
      title: messages.labelPositionTitle,
    },
    {
      src: imgFolderPath + 'enableDarkThemeOpt.png',
      description: messages.enableDarkThemeDescrip,
      title: messages.enableDarkThemeTitle,
    },
  ],
  scanning: [
    {
      src: imgFolderPath + 'enableScanning2.gif',
      description: messages.enableScanningDescrip,
      title: messages.enableScanningTitle,
    },
  ],
  navigation: [
    {
      src: imgFolderPath + 'enableContextAwareBackButton.png',
      description: messages.enableContextAwareBackButtonDescrip,
      title: messages.enableContextAwareBackButtonTitle,
    },
    {
      src: imgFolderPath + 'showSharePhraseButton.png',
      description: messages.showSharePhraseButtonDescrip,
      title: messages.showSharePhraseButtonTitle,
    },
    {
      src: imgFolderPath + 'removeSymbolsFromTheOutputBar.png',
      description: messages.removeSymbolsFromTheOutputBarDescrip,
      title: messages.removeSymbolsFromTheOutputBarTitle,
    },
    {
      src: imgFolderPath + 'folderVocalization.png',
      description: messages.folderVocalizationDescrip,
      title: messages.folderVocalizationTitle,
    },
  ],
};

const SettingsTour: React.FC<SettingsTourProps> = ({
  intl,
  disableTour,
  isSettingsTourEnabled,
}) => {
  const [tooltipSwiperText, setTooltipSwiperText] = useState<TooltipSwiperText>(
    { title: '', description: '' },
  );

  const handleOnSlideChange = (
    sectionEnabled: keyof TourImages,
    index: number,
  ): void => {
    for (const section in settingsTourImages) {
      if (section === sectionEnabled) {
        setTooltipSwiperText({
          title: (
            <FormattedMessage
              {...settingsTourImages[sectionEnabled][index].title}
            />
          ),
          description: (
            <FormattedMessage
              {...settingsTourImages[sectionEnabled][index].description}
            />
          ),
        });
      }
    }
  };

  const settingsTourSteps: Array<Record<string, unknown>> = [
    {
      target: 'body',
      placement: 'center' as const,
      hideCloseButton: true,
      styles: {
        tooltip: {
          width: '92vw',
          maxWidth: 540,
          borderRadius: 16,
          padding: '32px 32px 24px',
          boxShadow: '0 16px 48px rgba(0, 132, 200, 0.2)',
        },
      },
      content: (
        <div className="SettingsTour__welcome">
          <div className="SettingsTour__welcome-header">
            <img
              className="SettingsTour__welcome-logo"
              src="/images/logo.svg"
              alt="Komunicare"
            />
            <div className="SettingsTour__welcome-titles">
              <h1 className="SettingsTour__welcome-title">
                <FormattedMessage {...messages.walkthroughSettings} />
              </h1>
            </div>
          </div>
          <div className="SettingsTour__welcome-divider" />
          <p className="SettingsTour__welcome-body">
            <FormattedMessage {...messages.walkthroughSettingsDesc} />
          </p>
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Language',
      content: (
        <div className="SettingsTour__step">
          <span className="SettingsTour__step-icon">🌐</span>
          <span className="SettingsTour__step-text">
            <FormattedMessage {...messages.walkthroughLanguage} />
          </span>
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Speech',
      content: (
        <div className="SettingsTour__step">
          <span className="SettingsTour__step-icon">🔊</span>
          <span className="SettingsTour__step-text">
            <FormattedMessage {...messages.walkthroughSpeech} />
          </span>
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Export',
      content: (
        <div className="SettingsTour__step">
          <span className="SettingsTour__step-icon">📤</span>
          <span className="SettingsTour__step-text">
            <FormattedMessage {...messages.walkthroughExport} />
          </span>
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Import',
      content: (
        <div className="SettingsTour__step">
          <span className="SettingsTour__step-icon">📥</span>
          <span className="SettingsTour__step-text">
            <FormattedMessage {...messages.walkthroughImport} />
          </span>
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Display',
      content: (
        <div className="SettingsTour__swiper-wrap">
          <p className="SettingsTour__swiper-title">
            {tooltipSwiperText.title}
          </p>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={true}
            pagination={true}
            autoplay={{ delay: 4000, disableOnInteraction: true }}
            className="SettingsTour__swiper-inner mySwiper"
            onSlideChange={(swiper: { realIndex: number }) =>
              handleOnSlideChange('display', swiper.realIndex)
            }
            onInit={(swiper: { realIndex: number }) =>
              handleOnSlideChange('display', swiper.realIndex)
            }
          >
            {settingsTourImages.display.map((imgData: TourImage, i: number) => (
              <SwiperSlide key={`display-${i}`}>
                <div className="SettingsTour__slide-img-wrap">
                  <img
                    className="SettingsTour__slide-img"
                    src={imgData.src}
                    alt={intl.formatMessage(imgData.title)}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <p className="SettingsTour__swiper-desc">
            {tooltipSwiperText.description}
          </p>
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Scanning',
      content: (
        <div className="SettingsTour__swiper-wrap">
          <p className="SettingsTour__swiper-title">
            {tooltipSwiperText.title}
          </p>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            watchOverflow={true}
            className="SettingsTour__swiper-inner"
            onSlideChange={(swiper: { realIndex: number }) =>
              handleOnSlideChange('scanning', swiper.realIndex)
            }
            onInit={(swiper: { realIndex: number }) =>
              handleOnSlideChange('scanning', swiper.realIndex)
            }
          >
            {settingsTourImages.scanning.map(
              (imgData: TourImage, i: number) => (
                <SwiperSlide key={`scan-${i}`}>
                  <div className="SettingsTour__slide-img-wrap SettingsTour__slide-img-wrap--scanning">
                    <img
                      className="SettingsTour__slide-img"
                      src={imgData.src}
                      alt={intl.formatMessage(imgData.title)}
                    />
                  </div>
                </SwiperSlide>
              ),
            )}
          </Swiper>
          <p className="SettingsTour__swiper-desc">
            {tooltipSwiperText.description}
          </p>
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Navigation',
      content: (
        <div className="SettingsTour__swiper-wrap">
          <p className="SettingsTour__swiper-title">
            {tooltipSwiperText.title}
          </p>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={true}
            pagination={true}
            autoplay={{ delay: 2500, disableOnInteraction: true }}
            className="SettingsTour__swiper-inner mySwiper"
            onSlideChange={(swiper: { realIndex: number }) =>
              handleOnSlideChange('navigation', swiper.realIndex)
            }
            onInit={(swiper: { realIndex: number }) =>
              handleOnSlideChange('navigation', swiper.realIndex)
            }
          >
            {settingsTourImages.navigation.map(
              (imgData: TourImage, i: number) => (
                <SwiperSlide key={`nav-${i}`}>
                  <div className="SettingsTour__slide-img-wrap">
                    <img
                      className="SettingsTour__slide-img"
                      src={imgData.src}
                      alt={intl.formatMessage(imgData.title)}
                    />
                  </div>
                </SwiperSlide>
              ),
            )}
          </Swiper>
          <p className="SettingsTour__swiper-desc">
            {tooltipSwiperText.description}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Joyride
        callback={(data: { status: string }) => {
          const { status } = data;
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            disableTour({ isSettingsTourEnabled: false });
          }
        }}
        steps={settingsTourSteps as any}
        continuous={true}
        showSkipButton={true}
        showProgress={false}
        disableOverlayClose={true}
        run={isSettingsTourEnabled}
        scrollOffset={500}
        spotlightPadding={4}
        styles={joyrideStyles}
        scrollDuration={100}
        locale={{
          last: intl.formatMessage(messages.walkthroughEndTour),
          skip: intl.formatMessage(messages.walkthroughCloseTour),
          next: intl.formatMessage(messages.walkthroughNext),
          back: intl.formatMessage(messages.walkthroughBack),
        }}
      />
    </div>
  );
};

export default SettingsTour;
