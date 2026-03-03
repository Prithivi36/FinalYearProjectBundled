import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

let client = null;
let localAudioTrack;

AgoraRTC.setLogLevel(3)

function initializeClient() {
    client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    setupEventListeners();
}

async function joinChannel(channel,token) {
    await client.join(
        'a93ba219be3f40749b249260dea5b140',
        channel,
        token,
        0 
    );
    await createMicrophoneAudioTrack();
    await publishMicrophoneAudioTrack();
}

async function createMicrophoneAudioTrack() {
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
}

async function publishMicrophoneAudioTrack() {
    await client.publish([localAudioTrack]);
}

function setupEventListeners() {
    client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play();
        }
    });

    client.on('user-unpublished', async (user) => {
    });
}

async function leaveChannel() {
    if (localAudioTrack) {
        localAudioTrack.close();
        localAudioTrack = null;
    }
    await client.leave();
}

const Audio = () => {
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        initializeClient();
        joinChannel( sessionStorage.getItem('room') ,
        sessionStorage.getItem('agora-token'),
        );

        return () => {
            leaveChannel();
        };
    }, []);

    const toggleAudio = async () => {
        if (isMuted) {
            await localAudioTrack.setEnabled(true);
        } else {
            await localAudioTrack.setEnabled(false);
        }
        setIsMuted(!isMuted);
    };

    return (
        <div>
            <button className='btn btn-none' onClick={toggleAudio}>
                {isMuted ? <i className="bi bi-mic-mute-fill text-danger"></i> : <i className="bi bi-mic-fill text-primary"></i> }
            </button>
        </div>
    );
};

export default Audio;