import type { DocumentHead  } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import HorizontalTimeline from '~/components/horizontal-timeline/horizontal-timeline';
import styles from './index.module.css';
import { component$, createContextId, useContextProvider, useStore } from '@builder.io/qwik';

export const ages=
[
  '1980',
  '1985',
  '1990',
  '2011'
]

export type HorizontalTimelineState = 'closed' | 'open'

export const useAgesLoader = routeLoader$(() => {
  return ages;
});


export const TIMELINECONTEXT = createContextId<
  {
    ages: string[];
    ageSelected:string | null; 
    state: HorizontalTimelineState;
    hidden: boolean;
  }
>('timeline');

 
export default component$(() => {

      const timelineContext = useStore(
      {
        ages: useAgesLoader().value,
        ageSelected: null,
        state: 'closed' as HorizontalTimelineState,
        hidden: true
      }
    );

    useContextProvider(TIMELINECONTEXT, timelineContext);

    return (
        <>
          <div class={styles.container}>
            <HorizontalTimeline />                 
          </div>
        </>
    );
});

export const head: DocumentHead = { 
  title: 'Timeline',
  meta: [
    {
      name: 'description',
      content: 'Timeline POC made with Qwik',
    },
  ],
};
