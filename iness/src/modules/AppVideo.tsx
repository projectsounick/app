import { useEvent, useEventListener } from "expo";
import {
  VideoView,
  useVideoPlayer,
  type ContentType,
  type PlayerError,
  type VideoContentFit,
  type VideoSource,
} from "expo-video";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Image,
  Platform,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export const ResizeMode = {
  CONTAIN: "contain",
  COVER: "cover",
  STRETCH: "fill",
} as const;

type LegacyVideoSource =
  | VideoSource
  | {
      uri: string;
      headers?: Record<string, string>;
      overrideFileExtensionAndroid?: string;
    };

export type AppVideoPlaybackStatus = {
  isLoaded: boolean;
  positionMillis: number;
  durationMillis?: number;
  playableDurationMillis?: number;
  isPlaying: boolean;
  isBuffering: boolean;
  didJustFinish: boolean;
  isMuted: boolean;
  isLooping: boolean;
};

export type AppVideoRef = {
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  play: () => void;
  pause: () => void;
};

type AppVideoProps = {
  source: LegacyVideoSource;
  style?: StyleProp<ViewStyle>;
  resizeMode?: VideoContentFit;
  useNativeControls?: boolean;
  shouldPlay?: boolean;
  isLooping?: boolean;
  isMuted?: boolean;
  progressUpdateIntervalMillis?: number;
  usePoster?: boolean;
  posterSource?: ImageSourcePropType;
  posterStyle?: StyleProp<ImageStyle>;
  onLoadStart?: () => void;
  onLoad?: () => void;
  onReadyForDisplay?: () => void;
  onPlaybackStatusUpdate?: (status: AppVideoPlaybackStatus) => void;
  onError?: (error: PlayerError | Error) => void;
};

const contentTypeForExtension = (extension?: string): ContentType => {
  switch (extension?.toLowerCase()) {
    case "m3u8":
      return "hls";
    case "mpd":
      return "dash";
    case "ism":
    case "isml":
      return "smoothStreaming";
    default:
      return "auto";
  }
};

const normalizeSource = (source: LegacyVideoSource): VideoSource => {
  if (!source || typeof source === "string" || typeof source === "number") {
    return source;
  }

  if ("overrideFileExtensionAndroid" in source) {
    const { overrideFileExtensionAndroid, ...videoSource } = source;
    return {
      ...videoSource,
      contentType: contentTypeForExtension(overrideFileExtensionAndroid),
    };
  }

  return source;
};

export const Video = forwardRef<AppVideoRef, AppVideoProps>(function Video(
  {
    source,
    style,
    resizeMode = ResizeMode.CONTAIN,
    useNativeControls = false,
    shouldPlay = false,
    isLooping = false,
    isMuted = false,
    progressUpdateIntervalMillis = 500,
    usePoster = false,
    posterSource,
    posterStyle,
    onLoadStart,
    onLoad,
    onReadyForDisplay,
    onPlaybackStatusUpdate,
    onError,
  },
  ref
) {
  const videoViewRef = useRef<any>(null);
  const normalizedSource = normalizeSource(source);
  const sourceKey = JSON.stringify(normalizedSource);
  const [hasRenderedFirstFrame, setHasRenderedFirstFrame] = useState(false);
  const playbackCallbackRef = useRef(onPlaybackStatusUpdate);

  playbackCallbackRef.current = onPlaybackStatusUpdate;

  const player = useVideoPlayer(normalizedSource, (createdPlayer) => {
    createdPlayer.loop = isLooping;
    createdPlayer.muted = isMuted;
    createdPlayer.timeUpdateEventInterval = progressUpdateIntervalMillis / 1000;
  });

  const { status, error } = useEvent(player, "statusChange", {
    status: player.status,
    error: undefined,
  });
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const emitPlaybackStatus = useCallback(
    (didJustFinish = false, currentTime = player.currentTime) => {
      playbackCallbackRef.current?.({
        isLoaded: status !== "idle" && status !== "error",
        positionMillis: Math.max(0, currentTime * 1000),
        durationMillis:
          Number.isFinite(player.duration) && player.duration > 0
            ? player.duration * 1000
            : undefined,
        playableDurationMillis:
          Number.isFinite(player.bufferedPosition) && player.bufferedPosition >= 0
            ? player.bufferedPosition * 1000
            : undefined,
        isPlaying,
        isBuffering: status === "loading",
        didJustFinish,
        isMuted: player.muted,
        isLooping: player.loop,
      });
    },
    [isPlaying, player, status]
  );

  useEffect(() => {
    player.loop = isLooping;
  }, [isLooping, player]);

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    player.timeUpdateEventInterval = Math.max(
      0,
      progressUpdateIntervalMillis / 1000
    );
  }, [player, progressUpdateIntervalMillis]);

  useEffect(() => {
    if (!player) return;
    try {
      if (shouldPlay) {
        player.play();
      } else {
        player.pause();
      }
    } catch {
      // player may be in transition or unmounting
    }
  }, [player, shouldPlay]);

  useEffect(() => {
    if (shouldPlay && status === "readyToPlay" && !player.playing) {
      try {
        player.play();
      } catch {
        // ignore
      }
    }
  }, [player, shouldPlay, status]);

  useEffect(() => {
    setHasRenderedFirstFrame(false);
    if (normalizedSource) {
      onLoadStart?.();
    }
  }, [sourceKey]);

  useEffect(() => {
    if (status === "error" && error) {
      onError?.(error);
    }
    emitPlaybackStatus();
  }, [emitPlaybackStatus, error, onError, status]);

  useEventListener(player, "sourceLoad", () => {
    onLoad?.();
    emitPlaybackStatus();
  });

  useEventListener(player, "playingChange", () => {
    emitPlaybackStatus();
  });

  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    emitPlaybackStatus(false, currentTime);
  });

  useEventListener(player, "playToEnd", () => {
    emitPlaybackStatus(true, player.currentTime);
  });

  useImperativeHandle(ref, () => ({
    enterFullscreen: async () => {
      try {
        await videoViewRef.current?.enterFullscreen();
      } catch (e) {
        console.warn("enterFullscreen error", e);
      }
    },
    exitFullscreen: async () => {
      try {
        await videoViewRef.current?.exitFullscreen();
      } catch (e) {
        console.warn("exitFullscreen error", e);
      }
    },
    play: () => {
      try {
        player.play();
      } catch {}
    },
    pause: () => {
      try {
        player.pause();
      } catch {}
    },
  }));

  return (
    <View style={style}>
      <VideoView
        ref={videoViewRef}
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit={resizeMode}
        nativeControls={useNativeControls}
        fullscreenOptions={{ enable: true }}
        onFirstFrameRender={() => {
          setHasRenderedFirstFrame(true);
          onReadyForDisplay?.();
        }}
      />
      {usePoster && posterSource && !hasRenderedFirstFrame ? (
        <Image
          source={posterSource}
          style={[StyleSheet.absoluteFill, posterStyle]}
          resizeMode={resizeMode === "fill" ? "stretch" : resizeMode}
        />
      ) : null}
    </View>
  );
});
