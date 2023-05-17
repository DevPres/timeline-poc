import type { DocumentHead  } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import HorizontalTimeline from '~/components/horizontal-timeline/horizontal-timeline';
import styles from './index.module.css';
import { component$, createContextId, useContextProvider, useSignal, useStore, useTask$, useVisibleTask$  } from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build'

export const years=
[
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16'



]

export type HorizontalTimelineState = 'closed' | 'open'

export const useAgesLoader = routeLoader$(() => {
  return years;
});


export const TIMELINECONTEXT = createContextId<
  {
    years: string[];
    yearSelected:string | null; 
    state: HorizontalTimelineState;
    hidden: boolean;
  }
>('timeline');

 
export default component$(() => {

    const timelineContext = useStore(
      {
        years: useAgesLoader().value,
        yearSelected: null,
        state: 'closed' as HorizontalTimelineState,
        hidden: true
      }
    );

    useContextProvider(TIMELINECONTEXT, timelineContext);
    
    const mouseDown = useSignal(false);
    const posX = useSignal<number>(0);
    const containerRef = useSignal<Element>();
    const scrollLeft = useSignal<number>(0);
    const scrollTo = useSignal<number>(0);
    const scrollingDirection = useSignal<'left' | 'right' | null>();
    const scroll = useSignal<boolean>(false);
    const scrollBarPos = useSignal<number>(0);
    const maxScrollLeft = useSignal<number>(0);




    useVisibleTask$(({ track }) => {
      const state = track(() => timelineContext.state);
      if(containerRef.value) {
        
        maxScrollLeft.value = containerRef.value.scrollWidth - containerRef.value.clientWidth

        requestAnimationFrame(() => {
          if(state == 'closed' && containerRef.value) {
            scrollTo.value = 0;
          }
        })
      }
    })

    useTask$(({ track, cleanup}) => {
      const posToScroll = track(() => scrollTo.value);
      if(isServer) {
        return;
      }
      console.log('scrollTo',scrollTo.value)
      if(containerRef.value) {
        scroll.value = true;
      }
      cleanup(() => scroll.value = false);
    })

    useVisibleTask$(({ track, cleanup }) => {
      const scrolling = track(() => scroll.value)
      const  id = setInterval(() => {
        console.log('scrolling', scrolling);
        console.log('direction', scrollingDirection.value);
        if(!scrolling) clearInterval(id);
        if(containerRef.value) {
          if(scrollingDirection.value == 'left') {
            containerRef.value.scrollLeft = containerRef.value.scrollLeft - 2 
          } else {
            containerRef.value.scrollLeft = containerRef.value.scrollLeft + 2 
          }

          scrollBarPos.value = containerRef.value.scrollLeft

        }
      }, 1)
      cleanup(() => clearInterval(id))
    })

    useTask$(({ track }) => {
      const pos = track(() => scrollBarPos.value);
      if(isServer) {
        return;
      }
      console.log('scrollbaposr', pos);
      console.log('scrollto', scrollTo.value)
        if(pos == scrollTo.value || pos == 0 || pos > maxScrollLeft.value) {
          scroll.value = false;
        }
        if(scrollingDirection.value == 'right' && scrollTo.value < pos) {
          scroll.value = false
        }
        if(scrollingDirection.value == 'left' && scrollTo.value > pos) {
          scroll.value = false
        }

    })



    
    return (
        <>
          <div 
            ref={containerRef}
            onMouseDown$={(ev, currentTarget) => {
              posX.value = ev.clientX;
              scrollLeft.value = currentTarget.scrollLeft
              currentTarget.style.cursor = 'grabbing';
              currentTarget.style.userSelect = 'none';
              mouseDown.value = true;
            }} 
            onMouseUp$={(ev, currentTarget) => {
              mouseDown.value = false;
              currentTarget.style.cursor = 'grab';
              currentTarget.style.removeProperty('user-select');
            }}
            onMouseMove$={(ev, currentTarget) => {
              if(mouseDown.value) {
                const dx = ev.clientX - posX.value;
                scrollingDirection.value = dx > 0 ? 'left' : 'right'  ;
                scrollTo.value = scrollLeft.value - dx;
              }
            }}
            class={styles.container}>
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
