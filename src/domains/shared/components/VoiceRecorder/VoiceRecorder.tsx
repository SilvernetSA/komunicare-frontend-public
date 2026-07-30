import ClearIcon from '@mui/icons-material/Clear';
import MicIcon from '@mui/icons-material/Mic';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LinearProgress from '@mui/material/LinearProgress';
import React, { useState, useRef } from 'react';

import messages from './VoiceRecorder.messages';
import { useAppStore } from '@/domains/app/stores/appStore';
import { UserData } from '@/types/app';
import IconButton from '../UI/IconButton/IconButton';
import './VoiceRecorder.css';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface VoiceRecorderProps {
  src?: string;
  onChange: (audio: string) => void;
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  src,
  onChange,
  intl,
}) => {
  const userData = useAppStore((state) => state.userData);
  const _user: UserData | null = userData.email ? (userData as UserData) : null;

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob | null>(null);

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.ondataavailable = (event) => {
      chunksRef.current = event.data;
      setIsRecording(false);
    };

    mediaRecorderRef.current.onstop = () => {
      if (!chunksRef.current) return;

      const reader = new FileReader();
      reader.readAsDataURL(chunksRef.current);

      reader.onloadend = async () => {
        const audio = reader.result as string;
        if (onChange) {
          onChange(audio);
        }
      };
      chunksRef.current = null;
    };
  };

  const playAudio = (src: string) => {
    const audio = new Audio();
    audio.src = src;
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    audio.play();
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePlayClick = () => {
    if (!src) return;
    setIsPlaying(true);
    playAudio(src);
  };

  const recordStyle = { color: isRecording ? 'red' : 'grey' };
  const playStyle = { color: isPlaying ? 'green' : 'grey' };

  return (
    <div className="VoiceRecorder">
      <IconButton
        onClick={handleRecordClick}
        label={intl.formatMessage(messages.record)}
        size="large"
      >
        <MicIcon fontSize="large" style={recordStyle} />
      </IconButton>
      {isRecording && (
        <div className="VoiceRecorder__progress">
          <LinearProgress color="secondary" />
        </div>
      )}
      {src && !isRecording && (
        <>
          <IconButton
            onClick={handlePlayClick}
            label={intl.formatMessage(messages.play)}
            size="large"
          >
            <PlayArrowIcon fontSize="large" style={playStyle} />
          </IconButton>
          <IconButton
            onClick={() => onChange('')}
            label={intl.formatMessage(messages.clear)}
            size="large"
          >
            <ClearIcon fontSize="large" style={{ color: 'grey' }} />
          </IconButton>
        </>
      )}
    </div>
  );
};

export default VoiceRecorder;
