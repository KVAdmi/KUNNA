
import React, { useEffect, useRef } from 'react';
import { loadJitsiScript } from '../lib/loadJitsi'; // Asumiendo que tienes una función así

const JitsiMeetWrapper = ({ roomName, displayName, isModerator, onApiReady }) => {
  const jitsiContainer = useRef(null);
  const jitsiApi = useRef(null);

  const guestToolbarButtons = [
    'camera', 'chat', 'closedcaptions', 'desktop', 'fullscreen',
    'hangup', 'microphone', 'profile', 'raisehand', 'select-background',
    'settings', 'tileview', 'toggle-camera', 'videoquality'
  ];

  const moderatorToolbarButtons = [
    ...guestToolbarButtons,
    'mute-everyone', 'security', 'participants-pane'
  ];

  useEffect(() => {
    loadJitsiScript().then(() => {
        const domain = 'meet.jit.si'; // Reemplaza con tu dominio de Jitsi
        const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainer.current,
            userInfo: {
                displayName: displayName
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: isModerator ? moderatorToolbarButtons : guestToolbarButtons,
                BRAND_WATERMARK_LINK: " ",
                SHOW_JITSI_WATERMARK: false,
                SHOW_BRAND_WATERMARK: false,
                SHOW_POWERED_BY: false,
                SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            },
            configOverwrite: {
                prejoinPageEnabled: false,
                disableDeepLinking: true,
                startWithAudioMuted: true,
                startWithVideoMuted: true,
            }
        };

        // eslint-disable-next-line no-undef
        jitsiApi.current = new JitsiMeetExternalAPI(domain, options);

        if (onApiReady) {
          onApiReady(jitsiApi.current);
        }

        return () => jitsiApi.current?.dispose();
    });
  }, [isModerator, roomName, displayName]); // Recargar Jitsi si cambia el rol

  return <div ref={jitsiContainer} style={{ width: '100vw', height: '100vh' }} />;
};

export default JitsiMeetWrapper;
