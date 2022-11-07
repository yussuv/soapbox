import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list';
import { Button, CardBody, CardTitle, Form, Stack, Text, Toggle } from 'soapbox/components/ui';
import { useOwnAccount } from 'soapbox/hooks';
import { useUpdateCredentials } from 'soapbox/queries/accounts';

type FormData = {
  accepts_chat_messages?: boolean
  chats_onboarded: boolean
}

const messages = defineMessages({
  title: { id: 'chat.welcome.title', defaultMessage: 'Welcome to {br} Direct Messages!' },
  subtitle: { id: 'chat.welcome.subtitle', defaultMessage: 'By default, all messages are automatically deleted after 14 days for your security.' },
  acceptingMessageLabel: { id: 'chat.welcome.accepting_messages.label', defaultMessage: 'Allow your followers to start a new chat with you' },
  notice: { id: 'chat.welcome.notice', defaultMessage: 'You can change these settings later.' },
  submit: { id: 'chat.welcome.submit', defaultMessage: 'Save & Continue' },
});

const Welcome = () => {
  const account = useOwnAccount();
  const intl = useIntl();
  const updateCredentials = useUpdateCredentials();

  const [data, setData] = useState<FormData>({
    chats_onboarded: true,
    accepts_chat_messages: account?.accepts_chat_messages,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    updateCredentials.mutate(data);
  };

  return (
    <Stack className='py-20 px-4 sm:px-0'>
      <img
        src='/instance/images/chats/welcome.svg'
        className='mx-auto w-32 md:w-40 h-auto mb-10'
        alt='Chats'
      />

      <div className='w-full sm:w-3/5 xl:w-2/5 mx-auto mb-10'>
        <Text align='center' weight='bold' className='mb-6 text-2xl md:text-3xl leading-8'>
          {intl.formatMessage(messages.title, { br: <br /> })}
        </Text>

        <Text align='center' theme='muted'>
          {intl.formatMessage(messages.subtitle)}
        </Text>
      </div>

      <Form onSubmit={handleSubmit} className='space-y-8 w-full sm:w-2/3 lg:w-3/5 sm:mx-auto'>
        <Stack space={2}>
          <CardTitle title='Privacy' />

          <CardBody>
            <List>
              <ListItem
                label={intl.formatMessage(messages.acceptingMessageLabel)}
              >
                <Toggle
                  checked={data.accepts_chat_messages}
                  onChange={(event) => setData((prevData) => ({ ...prevData, accepts_chat_messages: event.target.checked }))}
                />
              </ListItem>
            </List>
          </CardBody>
        </Stack>

        <Text align='center' theme='muted'>
          {intl.formatMessage(messages.notice)}
        </Text>

        <Button type='submit' theme='primary' block size='lg' disabled={updateCredentials.isLoading}>
          {intl.formatMessage(messages.submit)}
        </Button>
      </Form>
    </Stack>
  );
};

export default Welcome;