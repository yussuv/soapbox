import classNames from 'classnames';
import { supportsPassiveEvents } from 'detect-passive-events';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { defineMessages, useIntl } from 'react-intl';
import { usePopper } from 'react-popper';

import { IconButton } from 'soapbox/components/ui';
import { useSettings } from 'soapbox/hooks';

import { buildCustomEmojis } from '../../emoji';
import { EmojiPicker as EmojiPickerAsync } from '../../ui/util/async-components';
// import { Picker as EmojiPicker } from '../../emoji/emoji_picker';

import type { List } from 'immutable';
import type { Emoji } from 'soapbox/features/emoji';

let EmojiPicker: any; // load asynchronously

const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
  emoji_search: { id: 'emoji_button.search', defaultMessage: 'Search…' },
  emoji_not_found: { id: 'emoji_button.not_found', defaultMessage: 'No emoji\'s found.' },
  custom: { id: 'emoji_button.custom', defaultMessage: 'Custom' },
  recent: { id: 'emoji_button.recent', defaultMessage: 'Frequently used' },
  search_results: { id: 'emoji_button.search_results', defaultMessage: 'Search results' },
  people: { id: 'emoji_button.people', defaultMessage: 'People' },
  nature: { id: 'emoji_button.nature', defaultMessage: 'Nature' },
  food: { id: 'emoji_button.food', defaultMessage: 'Food & Drink' },
  activity: { id: 'emoji_button.activity', defaultMessage: 'Activity' },
  travel: { id: 'emoji_button.travel', defaultMessage: 'Travel & Places' },
  objects: { id: 'emoji_button.objects', defaultMessage: 'Objects' },
  symbols: { id: 'emoji_button.symbols', defaultMessage: 'Symbols' },
  flags: { id: 'emoji_button.flags', defaultMessage: 'Flags' },
});

interface IEmojiPickerDropdown {
  custom_emojis: List<any>,
  frequentlyUsedEmojis: string[],
  intl: any,
  onPickEmoji: (emoji: Emoji) => void,
  onSkinTone: () => void,
  skinTone: () => void,
}

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

const EmojiPickerDropdown: React.FC<IEmojiPickerDropdown> = ({ custom_emojis, frequentlyUsedEmojis, onPickEmoji, onSkinTone, skinTone }) => {
  const intl = useIntl();
  const settings = useSettings();
  const title = intl.formatMessage(messages.emoji);
  const userTheme = settings.get('themeMode');
  const theme = (userTheme === 'dark' || userTheme === 'light') ? userTheme : 'auto';

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top-start',
  });

  const handleToggle = () => {
    setVisible(!visible);
  };

  const handleDocClick = (e: any) => {
    if (!containerElement?.contains(e.target) && !popperElement?.contains(e.target)) {
      setVisible(false);
    }
  };

  const handlePick = (emoji: Emoji) => {
    // TODO: remove me
    if (!emoji.native) {
      emoji.native = emoji.shortcodes;
    }

    setVisible(false);
    onPickEmoji(emoji);
  };

  const getI18n = () => {
    return {
      search: intl.formatMessage(messages.emoji_search),
      notfound: intl.formatMessage(messages.emoji_not_found),
      categories: {
        search: intl.formatMessage(messages.search_results),
        recent: intl.formatMessage(messages.recent),
        people: intl.formatMessage(messages.people),
        nature: intl.formatMessage(messages.nature),
        foods: intl.formatMessage(messages.food),
        activity: intl.formatMessage(messages.activity),
        places: intl.formatMessage(messages.travel),
        objects: intl.formatMessage(messages.objects),
        symbols: intl.formatMessage(messages.symbols),
        flags: intl.formatMessage(messages.flags),
        custom: intl.formatMessage(messages.custom),
      },
    };
  };

  useEffect(() => {
    document.addEventListener('click', handleDocClick, false);
    document.addEventListener('touchend', handleDocClick, listenerOptions);

    return function cleanup() {
      document.removeEventListener('click', handleDocClick);
      document.removeEventListener('touchend', handleDocClick);
    };
  });

  useEffect(() => {
    if (!EmojiPicker) {
      setLoading(true);

      EmojiPickerAsync().then(EmojiMart => {
        EmojiPicker = EmojiMart.Picker;

        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [visible]);

  let Popup;

  if (loading) {
    Popup = () => <div />;
  } else {
    Popup = () => (
      <div>
        <EmojiPicker
          custom={[{ emojis: buildCustomEmojis(custom_emojis) }]}
          title={title}
          onEmojiSelect={handlePick}
          recent={frequentlyUsedEmojis}
          perLine={8}
          skin={onSkinTone}
          emojiSize={38}
          emojiButtonSize={50}
          set={'twitter'}
          theme={theme}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className='relative' ref={setContainerElement}>
      <IconButton
        className={classNames({
          'text-gray-400 hover:text-gray-600': true,
          'pulse-loading': visible && loading,
        })}
        ref={setReferenceElement}
        src={require('@tabler/icons/icons/mood-happy.svg')}
        title={title}
        aria-label={title}
        aria-expanded={visible}
        role='button'
        onClick={handleToggle}
        onKeyDown={handleToggle}
        tabIndex={0}
      />

      {createPortal(
        <div
          className={classNames({
            'z-1000': true,
          })}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          {visible && (<Popup />)}
        </div>,
        document.body,
      )}
    </div>
  );
};

export default EmojiPickerDropdown;