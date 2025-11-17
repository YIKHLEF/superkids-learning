import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import { PauseCircle, PlayCircle, VolumeUp } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomVideoPlayerProps {
  src: string;
  title: string;
  description?: string;
  poster?: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src, title, description, poster }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 720 }}>
      <Box
        sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}
        aria-label={`${title} player`}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          style={{ width: '100%', display: 'block' }}
          aria-describedby={`${title}-description`}
        />
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.35))',
              }}
            >
              <IconButton color="primary" onClick={togglePlayback} sx={{ bgcolor: 'white', p: 1 }} aria-label="Lire la vidéo">
                <PlayCircle sx={{ fontSize: 56 }} />
              </IconButton>
            </motion.div>
          )}
        </AnimatePresence>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ position: 'absolute', bottom: 8, left: 8, right: 8, bgcolor: 'rgba(0,0,0,0.55)', p: 1, borderRadius: 2 }}
        >
          <IconButton onClick={togglePlayback} aria-label={isPlaying ? 'Mettre en pause' : 'Lire'} sx={{ color: 'white' }}>
            {isPlaying ? <PauseCircle /> : <PlayCircle />}
          </IconButton>
          <VolumeUp sx={{ color: 'white' }} aria-hidden />
          <LinearProgress
            variant="determinate"
            value={progress}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.25)', '& .MuiLinearProgress-bar': { bgcolor: 'secondary.light' } }}
          />
        </Stack>
      </Box>
      <Typography id={`${title}-description`} variant="body1" sx={{ mt: 1.5 }}>
        {description}
      </Typography>
    </Box>
  );
};

export default CustomVideoPlayer;
