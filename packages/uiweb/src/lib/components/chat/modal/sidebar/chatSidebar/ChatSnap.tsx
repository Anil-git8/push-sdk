import type { IFeeds } from '@pushprotocol/restapi';
import { ChatMainStateContext, ChatAndNotificationPropsContext } from '../../../../../context';
import {
  checkIfUnread,
  dateToFromNowDaily,
  setData,
  shortenText,
} from '../../../../../helpers';
import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { Section, Span, Image } from '../../../../reusables/sharedStyling';
import { UnreadChats } from '../../../MinimisedModalHeader';
import { pCAIP10ToWallet } from '../../../../../helpers';
import { ethers } from 'ethers';
import { useResolveWeb3Name } from '../../../../../hooks';
import { device } from '../../../../../config';

type ChatSnapPropType = {
  chat: IFeeds;
  id: string;
};

//fix messageType type
const Message = ({
  messageContent,
  messageType,
}: {
  messageContent: string;
  messageType: string;
}) => {
  return messageType === 'Text' ? (
    <Span textAlign="left" fontWeight="400" fontSize="16px" color="#62626A">
      {messageContent?.length > 25
        ? messageContent?.slice(0, 25) + '...'
        : messageContent}
    </Span>
  ) : messageType === 'Image' ? (
    <Span textAlign="left" fontWeight="400" fontSize="16px" color="#62626A">
      <i className="fa fa-picture-o" aria-hidden="true"></i> Image
    </Span>
  ) : messageType === 'File' ? (
    <Span textAlign="left" fontWeight="400" fontSize="16px" color="#62626A">
      <i className="fa fa-file" aria-hidden="true"></i> File
    </Span>
  ) : messageType === 'GIF' || messageType === 'MediaEmbed' ? (
    <Span textAlign="left" fontWeight="400" fontSize="16px" color="#62626A">
      <i className="fa fa-picture-o" aria-hidden="true"></i> Media
    </Span>
  ) : null;
};


export const ChatSnap: React.FC<ChatSnapPropType> = ({ chat, id }) => {
  const { setSelectedChatId, web3NameList, activeTab } =
    useContext<any>(ChatMainStateContext);
  const { env } = useContext<any>(ChatAndNotificationPropsContext);

  useResolveWeb3Name(chat?.did, env);
  //shift to helper
  const walletLowercase = pCAIP10ToWallet(chat?.did)?.toLowerCase();
  const checksumWallet = walletLowercase
    ? ethers.utils.getAddress(walletLowercase)
    : null;
  const web3Name = checksumWallet ? web3NameList[checksumWallet] : null;

  const handleOnClick = () => {
    setSelectedChatId(id);
    setData({ chatId: id, value: chat });
  };

  return (
    <Container
      justifyContent="space-between"
      padding="15px 15px"
      onClick={() => handleOnClick()}
    >
      <Section gap="18px">
        <Image
          src={chat.profilePicture!}
          alt="profile picture"
          width="36px"
          height="36px"
          borderRadius="100%"
        />
        <Section flexDirection="column" gap="8px" alignItems="start">
          <NameSpan fontWeight="700" fontSize="16px" color="#000">
          {(chat?.name)?shortenText(chat?.name, 30) :
         ( web3Name ?? shortenText(chat?.did?.split(':')[1], 20))}

          </NameSpan>
          <Message
            messageContent={chat?.msg?.messageContent}
            messageType={chat?.msg?.messageType}
          />
        </Section>
      </Section>
      <Section
        flexDirection="column"
        alignItems="end"
        gap="12px"
        justifyContent="flex-start"
      >
        <Span fontWeight="400" fontSize="12px" color="#62626A">
          {chat?.msg?.timestamp
            ? dateToFromNowDaily(chat?.msg?.timestamp as number)
            : ''}
        </Span>
        {checkIfUnread(id, chat) && (
          <UnreadChats
          //  numberOfUnreadMessages="3"
          />
        )}
      </Section>
    </Container>
  );
};

//styles
const Container = styled(Section)`
  border-bottom: 1px dashed #ededee;
  cursor: pointer;
  &:hover {
    background: #f4f5fa;
  }
`;

const NameSpan = styled(Span)`
  @media ${device.mobileS} {
    font-size: 14px;
  }
`;