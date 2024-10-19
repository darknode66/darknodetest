'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useSearchParams } from 'next/navigation';
import { Users, LayoutList } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  // New states for transcription and sentiment
  const [transcript, setTranscript] = useState('');
  const [sentimentLabel, setSentimentLabel] = useState('Neutral');

  // Wit.ai Access Token (Replace this with your Wit.ai token)
  const WIT_AI_ACCESS_TOKEN = process.env.NEXT_PUBLIC_WIT_AI_ACCESS_TOKEN;

  // Function to send audio to Wit.ai and get transcription
  const sendAudioToWitAI = async (audioBlob: Blob) => {
    try {
      const response = await axios.post(
        'https://api.wit.ai/speech?v=20230206', // You can update the version date if needed
        audioBlob, // Send the raw Blob directly
        {
          headers: {
            Authorization: `Bearer ${WIT_AI_ACCESS_TOKEN}`,
            'Content-Type': 'audio/wav', // Ensure this matches the format of the audioBlob (e.g., 'audio/wav')
          },
        }
      );

      const { text, traits } = response.data;

      if (text) {
        setTranscript(text);

        // Wit.ai may return traits that indicate sentiment (depending on training)
        if (traits && traits.joke) {
          setSentimentLabel('Joking');
        } else if (traits && traits.sarcasm) {
          setSentimentLabel('Sarcastic');
        } else {
          setSentimentLabel('Neutral');
        }
      }
    } catch (error) {
      console.error('Error with Wit.ai API:', error);
    }
  };
  // Automatically start audio recording when the meeting starts (CallingState.JOINED)
  useEffect(() => {
    if (callingState !== CallingState.JOINED) return;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        mediaRecorder.start();
        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          audioChunks.length = 0;
          await sendAudioToWitAI(audioBlob);
        };

        // Stop and start the recorder every 15 seconds to send audio to Wit.ai
        const intervalId = setInterval(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            mediaRecorder.start();
          }
        }, 15000);

        return () => {
          clearInterval(intervalId);
          mediaRecorder.stop();
        };
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  }, [callingState]);

  // Function to hide participants
  const hideParticipants = () => {
    setShowParticipants(false);
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)]', {
            hidden: !showParticipants, // hide participants when showParticipants is false
            block: showParticipants,
          })}
        >
          <CallParticipantsList onClose={hideParticipants} /> {/* Pass the hideParticipants function */}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-dark-1">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-4 text-sm">
            <DropdownMenuItem
              onClick={() => setLayout('speaker-left')}
            >
              Speaker Left
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLayout('speaker-right')}
            >
              Speaker Right
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayout('grid')}>
              Grid
            </DropdownMenuItem>
            <DropdownMenuSeparator className="border-dark-1" />
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>

      {/* Sidebar integration for real-time transcript and sentiment */}
      <Sidebar transcript={transcript} sentimentLabel={sentimentLabel} />
    </section>
  );
};

export default MeetingRoom;