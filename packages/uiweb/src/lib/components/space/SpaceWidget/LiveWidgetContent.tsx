import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import * as PushAPI from '@pushprotocol/restapi';

import { LiveSpaceProfileContainer } from './LiveSpaceProfileContainer';
import { SpaceMembersSectionModal } from './SpaceMembersSectionModal';

import { Button, Image, Item, Text } from '../../../config';
import MicOnIcon from '../../../icons/micon.svg';
import MicEngagedIcon from '../../../icons/MicEngage.svg';
import MuteIcon from '../../../icons/Muted.svg';
import ShareIcon from '../../../icons/Share.svg';
import MembersIcon from '../../../icons/Members.svg';
import { SpaceDTO } from '@pushprotocol/restapi';

import { useSpaceData } from '../../../hooks';
import { Player } from '@livepeer/react';
import { createBlockie } from '../helpers/blockies';

interface LiveWidgetContentProps {
  spaceData?: SpaceDTO;
  // temp props only for testing demo purpose for now
  isHost?: boolean;
}

export const LiveWidgetContent: React.FC<LiveWidgetContentProps> = ({
  spaceData,
  isHost,
}) => {
  const [showMembersModal, setShowMembersModal] = useState<boolean>(false);
  const [playBackUrl, setPlayBackUrl] = useState<string>('');
  const {
    spacesObjectRef,
    spaceObjectData,
    setSpaceObjectData,
    isSpeaker,
    isListener,
    setSpaceWidgetId,
    isJoined,
    initSpaceObject,
  } = useSpaceData();
  console.log(
    '🚀 ~ file: LiveWidgetContent.tsx:41 ~ spaceObjectData:',
    spaceObjectData
  );

  const isMicOn = spaceObjectData?.connectionData?.local?.audio;

  const handleMicState = async () => {
    await spacesObjectRef?.current?.enableAudio?.({ state: !isMicOn });
  };

  const handleJoinSpace = async () => {
    if (!spaceData) {
      return;
    }

    await initSpaceObject?.(spaceData?.spaceId as string);
    if (isListener) {
      console.log('joining as a listener');
      await spacesObjectRef?.current?.join?.();
      setSpaceWidgetId?.(spaceData?.spaceId as string);
      console.log('space joined');
    }
  };

  const handleEndSpace = async () => {
    if (!spacesObjectRef?.current) return;
    await spacesObjectRef?.current?.stop?.();
    spacesObjectRef.current = null;
    setSpaceObjectData?.(PushAPI.space.initSpaceData);
    window.alert('Space ended');
  };

  const handleLeaveSpace = async () => {
    if (!spacesObjectRef?.current) return;
    if (isHost || isSpeaker) {
      await spacesObjectRef?.current?.leave?.();
      spacesObjectRef.current = null;
      setSpaceObjectData?.(PushAPI.space.initSpaceData);
      console.log('Space left');
    }
    if (isListener) {
      spacesObjectRef.current = null;
      setSpaceObjectData?.(PushAPI.space.initSpaceData);
      window.alert('Thank you for listening. Bye!');
    }
  };

  useEffect(() => {
    const createAudioStream = async () => {
      console.log('isSpeaker', isSpeaker);
      if (isSpeaker && !spaceObjectData?.connectionData?.local?.stream) {
        // create audio stream as we'll need it to start the mesh connection
        console.log('creating audio stream');
        await spacesObjectRef?.current?.createAudioStream?.();
      }
    };
    createAudioStream();
  }, [isSpeaker]);

  useEffect(() => {
    if (
      !spaceObjectData?.connectionData?.local?.stream ||
      !isSpeaker ||
      (spaceObjectData?.connectionData?.incoming?.length ?? 0) > 1
    )
      return;

    const joinSpaceAsSpeaker = async () => {
      console.log('joining as a speaker');
      await spacesObjectRef?.current?.join?.();
      setSpaceWidgetId?.(spaceData?.spaceId as string);
      console.log('space joined');
    };
    joinSpaceAsSpeaker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceObjectData?.connectionData?.local?.stream]);

  useEffect(() => {
    if (!spaceObjectData?.spaceDescription) return;
    const playBackUrl = spaceObjectData?.spaceDescription;
    setPlayBackUrl(playBackUrl);
  }, [spaceObjectData?.spaceDescription]);

  return (
    <>
      <Item
        flex={'1'}
        display={'flex'}
        padding={'16px 10px'}
        flexWrap={'wrap'}
        justifyContent={'flex-start'}
        gap={'24px 12px'}
        overflowY={'auto'}
        alignContent={'flex-start'}
      >
        {(isSpeaker || isHost) &&
          spaceObjectData?.connectionData?.incoming
            ?.slice(1)
            .map((profile) => (
              <LiveSpaceProfileContainer
                isHost={isHost}
                isSpeaker={isSpeaker}
                wallet={profile?.address}
                image={createBlockie?.(profile?.address)?.toDataURL()?.toString()}
                stream={profile?.stream}
              />
            ))}
        {isListener &&
          !isHost &&
          spaceObjectData?.members?.map((profile) => (
            <LiveSpaceProfileContainer
              isHost={isHost}
              isSpeaker={isSpeaker}
              wallet={profile?.wallet}
              image={profile?.image}
            />
          ))}
      </Item>
      <Item padding={'28px 10px'} width={'90%'}>
        {isJoined ? (
          <Item
            borderRadius={'8px'}
            background={'#EDE9FE'}
            display={'flex'}
            justifyContent={'space-between'}
            padding={'6px 8px'}
          >
            <Item
              cursor={'pointer'}
              display={'flex'}
              alignItems={'center'}
              gap={'8px'}
              padding={'10px'}
              onClick={() => (isHost || isSpeaker ? handleMicState() : null)}
            >
              <Image
                width={'14px'}
                height={'20px'}
                src={
                  isHost || isSpeaker
                    ? isMicOn
                      ? MicEngagedIcon
                      : MuteIcon
                    : MicOnIcon
                }
                alt="Mic Icon"
              />
              <Text color="#8B5CF6" fontSize={'14px'} fontWeight={600}>
                {isHost || isSpeaker
                  ? isMicOn
                    ? 'Speaking'
                    : 'Muted'
                  : 'Request'}
              </Text>
            </Item>
            <Item display={'flex'} alignItems={'center'} gap={'16px'}>
              <Image
                width={'21px'}
                height={'24px'}
                src={MembersIcon}
                cursor={'pointer'}
                onClick={() => setShowMembersModal(true)}
                alt="Members Icon"
              />
              <Image
                width={'24px'}
                height={'24px'}
                src={ShareIcon}
                cursor={'pointer'}
                alt="Share Icon"
              />
              <Button
                color="#8B5CF6"
                fontSize={'14px'}
                fontWeight={600}
                width={'100px'}
                height={'100%'}
                cursor={'pointer'}
                border={'1px solid #8B5CF6'}
                borderRadius={'12px'}
                onClick={isHost ? handleEndSpace : handleLeaveSpace}
              >
                {!isHost ? 'Leave' : 'End space'}
              </Button>
            </Item>
            {isListener && !isHost && playBackUrl?.length > 0 && (
              <PeerPlayer
                title="spaceAudio"
                playbackId={playBackUrl}
                autoPlay
              />
            )}
          </Item>
        ) : (
          <Button
            height={'36px'}
            width={'100%'}
            border={'none'}
            borderRadius={'8px'}
            cursor={'pointer'}
            background={
              'linear-gradient(87.17deg, #EA4EE4 0%, #D23CDF 0.01%, #8B5CF6 100%), linear-gradient(87.17deg, #EA4E93 0%, #DB2777 0.01%, #9963F7 100%), linear-gradient(87.17deg, #B6A0F5 0%, #F46EF7 50.52%, #FFDED3 100%, #FFCFC5 100%), linear-gradient(0deg, #8B5CF6, #8B5CF6), linear-gradient(87.17deg, #B6A0F5 0%, #F46EF7 57.29%, #FF95D5 100%), #FFFFFF'
            }
            onClick={handleJoinSpace}
          >
            <Text color="white" fontSize={'16px'} fontWeight={'600'}>
              Join this space
            </Text>
          </Button>
        )}
        {showMembersModal ? (
          <SpaceMembersSectionModal
            onClose={() => setShowMembersModal(false)}
          />
        ) : null}
      </Item>
    </>
  );
};

const PeerPlayer = styled(Player)`
  width: 0;
  height: 0;
`;