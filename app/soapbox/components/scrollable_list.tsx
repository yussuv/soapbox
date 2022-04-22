import React from 'react';
import { Virtuoso } from 'react-virtuoso';

import PullToRefresh from 'soapbox/components/pull-to-refresh';
// import { useSettings } from 'soapbox/hooks';

import { Spinner, Text } from './ui';

// Ensure the className winds up here
const List = React.forwardRef((props: any, ref: React.ForwardedRef<HTMLDivElement>) => {
  const { context, ...rest } = props;
  return <div ref={ref} className={context.listClassName} {...rest} />;
});

interface IScrollableList {
  scrollKey?: string,
  onLoadMore?: () => void,
  isLoading?: boolean,
  showLoading?: boolean,
  hasMore?: boolean,
  prepend?: React.ReactElement,
  alwaysPrepend?: boolean,
  emptyMessage?: React.ReactNode,
  children: Iterable<React.ReactNode>,
  onScrollToTop?: () => void,
  onScroll?: () => void,
  placeholderComponent?: React.ComponentType,
  placeholderCount?: number,
  onRefresh?: () => Promise<any>,
  className?: string,
}

/** Legacy ScrollableList with Virtuoso for backwards-compatibility */
const ScrollableList: React.FC<IScrollableList> = ({
  prepend = null,
  alwaysPrepend,
  children,
  isLoading,
  emptyMessage,
  showLoading,
  onRefresh,
  onScroll,
  onScrollToTop,
  onLoadMore,
  className,
  hasMore,
  placeholderComponent: Placeholder,
  placeholderCount = 0,
}) => {
  // const settings = useSettings();
  // const autoload = settings.get('autoloadMore');

  const showPlaceholder = showLoading && Placeholder && placeholderCount > 0;
  const data = showPlaceholder ? Array(placeholderCount).fill('') : Array.from(children || []);

  /* Render an empty state instead of the scrollable list */
  const renderEmpty = () => {
    return (
      <div className='mt-2'>
        {alwaysPrepend && prepend}

        <div className='bg-primary-50 dark:bg-slate-700 mt-2 rounded-lg text-center p-8'>
          {isLoading ? (
            <Spinner />
          ) : (
            <Text>{emptyMessage}</Text>
          )}
        </div>
      </div>
    );
  };

  /** Render the actual item */
  const renderItem = (_i: number, element: JSX.Element) => {
    if (showPlaceholder) {
      return <Placeholder />;
    } else {
      return element;
    }
  };

  // Don't use Virtuoso's EmptyPlaceholder component so it preserves height
  if (data.length === 0) {
    return renderEmpty();
  }

  // Don't use Virtuoso's Footer component so it preserves spacing
  if (hasMore && Placeholder) {
    data.push(<Placeholder />);
  }

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <Virtuoso
        useWindowScroll
        className={className}
        data={data}
        startReached={onScrollToTop}
        endReached={onLoadMore}
        isScrolling={isScrolling => isScrolling && onScroll && onScroll()}
        itemContent={renderItem}
        context={{
          listClassName: className,
        }}
        components={{
          Header: () => prepend,
          ScrollSeekPlaceholder: Placeholder as any,
          EmptyPlaceholder: () => renderEmpty(),
          List,
        }}
      />
    </PullToRefresh>
  );
};

export default ScrollableList;
