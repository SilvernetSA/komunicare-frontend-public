import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Joyride, { STATUS } from 'react-joyride';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';

import messages from './Settings.messages';
import 'swiper/swiper.min.css';
import 'swiper/components/navigation/navigation.min.css';
import 'swiper/components/pagination/pagination.min.css';
import './Settings.css';

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

const swiperUse = (SwiperCore as { use: (modules: unknown[]) => void }).use;

const joyRideStyles = {
  options: {
    arrowColor: '#eee',
    backgroundColor: '#eee',
    primaryColor: '#aa00ff',
    textColor: '#333',
    width: 500,
    zIndex: 10000,
  },
  tooltipContent: {
    padding: '5px 5px',
  },
};

const imgFolderPath = '../../../images/tour/settingsTour/';
let settingsTourImages: TourImages = {
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
  useEffect(() => {
    swiperUse([Navigation, Pagination, Autoplay]);
  }, []);

  const [tooltipSwiperText, setTooltipSwiperText] = useState<TooltipSwiperText>(
    {
      title: '',
      description: '',
    },
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
      content: (
        <div>
          <h2>
            <FormattedMessage {...messages.walkthroughSettings} />
          </h2>
          <h5>
            <FormattedMessage {...messages.walkthroughSettingsDesc} />
          </h5>
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Language',
      content: (
        <div>
          <FormattedMessage {...messages.walkthroughLanguage} />
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Speech',
      content: (
        <div>
          <FormattedMessage {...messages.walkthroughSpeech} />
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Export',
      content: (
        <div>
          <FormattedMessage {...messages.walkthroughExport} />
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Import',
      content: (
        <div>
          <FormattedMessage {...messages.walkthroughImport} />
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Display',
      content: (
        <div className="Settings__Tour__Step__Swiper__Container">
          <h2 className="Settings_Tour_Tooltip_Swiper_Title">
            {tooltipSwiperText.title}
          </h2>
          <Swiper
            navigation={true}
            pagination={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: true,
            }}
            className="mySwiper"
            onSlideChange={(swiper: { realIndex: number }) => {
              handleOnSlideChange('display', swiper.realIndex);
            }}
            onInit={(swiper: { realIndex: number }) => {
              handleOnSlideChange('display', swiper.realIndex);
            }}
          >
            {settingsTourImages.display.map(
              (imgData: TourImage, inx: number) => (
                <SwiperSlide key={`slide-${inx}`}>
                  <div className="swiperSlideContentContainer">
                    <img
                      src={imgData.src}
                      alt={intl.formatMessage(imgData.title)}
                      key={intl.formatMessage(imgData.title)}
                    />
                  </div>
                </SwiperSlide>
              ),
            )}
          </Swiper>
          <div>{tooltipSwiperText.description}</div>
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Scanning',
      content: (
        <div>
          <h2 className="Settings_Tour_Tooltip_Swiper_Title">
            {tooltipSwiperText.title}
          </h2>
          <Swiper
            watchOverflow={true}
            onSlideChange={(swiper: { realIndex: number }) => {
              handleOnSlideChange('scanning', swiper.realIndex);
            }}
            onInit={(swiper: { realIndex: number }) => {
              handleOnSlideChange('scanning', swiper.realIndex);
            }}
          >
            {settingsTourImages.scanning.map(
              (imgData: TourImage, _inx: number) => (
                <SwiperSlide key={intl.formatMessage(imgData.title)}>
                  <div className="swiperSlideContentContainer Settings__Tour__Scanning__Img">
                    <img
                      style={{ height: '100% ' }}
                      src={imgData.src}
                      alt={intl.formatMessage(imgData.title)}
                      key={intl.formatMessage(imgData.title)}
                    />
                  </div>
                </SwiperSlide>
              ),
            )}
          </Swiper>
          <div className="Settings_Tour_Description_Scanning">
            {tooltipSwiperText.description}
          </div>
        </div>
      ),
    },
    {
      hideCloseButton: true,
      target: '#Navigation',
      content: (
        <div className="Settings__Tour__Step__Swiper__Container">
          <h2 className="Settings_Tour_Tooltip_Swiper_Title">
            {tooltipSwiperText.title}
          </h2>
          <Swiper
            navigation={true}
            pagination={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: true,
            }}
            className="mySwiper"
            onSlideChange={(swiper: { realIndex: number }) => {
              handleOnSlideChange('navigation', swiper.realIndex);
            }}
            onInit={(swiper: { realIndex: number }) => {
              handleOnSlideChange('navigation', swiper.realIndex);
            }}
          >
            {settingsTourImages.navigation.map(
              (imgData: TourImage, _inx: number) => (
                <SwiperSlide key={intl.formatMessage(imgData.title)}>
                  <div className="swiperSlideContentContainer">
                    <img
                      src={imgData.src}
                      alt={intl.formatMessage(imgData.title)}
                      key={intl.formatMessage(imgData.title)}
                    />
                  </div>
                </SwiperSlide>
              ),
            )}
          </Swiper>
          <div>{tooltipSwiperText.description}</div>
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
        //disableScrollParentFix={true}
        showProgress={false}
        disableOverlayClose={true}
        run={isSettingsTourEnabled}
        scrollOffset={500}
        spotlightPadding={4}
        styles={joyRideStyles}
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
