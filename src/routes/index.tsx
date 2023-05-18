import type { DocumentHead  } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import HorizontalTimeline from '~/components/horizontal-timeline/horizontal-timeline';
import styles from './index.module.css';
import { component$, createContextId, useContextProvider, useSignal, useStore, useTask$, useVisibleTask$  } from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build'


export type HorizontalTimelineState = 'closed' | 'open'

export const useAgesLoader = routeLoader$(() => {
  const years = [];
  for( let i = 1; i <= 200; i++) {
    years.push(String(i))
  }
  return years;
});


export const TIMELINECONTEXT = createContextId<
  {
    years: string[];
    yearSelected:string | null; 
    state: HorizontalTimelineState;
    hidden: boolean;
    scrollVelocity: number;
    scrollStep: number;
  }
>('timeline');

 
export default component$(() => {

    const timelineContext = useStore(
      {
        years: useAgesLoader().value,
        yearSelected: null,
        state: 'closed' as HorizontalTimelineState,
        hidden: true,
        scrollVelocity: 0.5,
        scrollStep: 6,
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
            scrollingDirection.value = 'left' 
            containerRef.value.scrollLeft = 0;
          }
        })
      }
    })

    useTask$(({ track, cleanup}) => {
      const posToScroll = track(() => scrollTo.value);
      if(isServer) {
        return;
      }
      if(containerRef.value) {
        scroll.value = true;
      }
      cleanup(() => scroll.value = false);
    })

    useVisibleTask$(({ track, cleanup }) => {
      const scrolling = track(() => scroll.value)
      const  id = setInterval(() => {
        //console.log('scrolling', scrolling);
        //console.log('direction', scrollingDirection.value);
        //console.log('scroll pos', scrollBarPos.value);
        //console.log('scroll to', scrollTo.value);
        if(!scrolling) clearInterval(id);
        if(containerRef.value) {

          if(scrollBarPos.value == scrollTo.value) {
            scroll.value = false;
            clearInterval(id)
          }
          if(scrollingDirection.value == 'right' && (scrollTo.value < scrollBarPos.value || scrollBarPos.value == maxScrollLeft.value)) {
            scroll.value = false
            clearInterval(id)
          }
          if(scrollingDirection.value == 'left' && (scrollTo.value > scrollBarPos.value || scrollBarPos.value == 0 )) {
            scroll.value = false
            clearInterval(id)
          }
         // console.log('passo')
         // console.log(' scroll direction' ,scrollingDirection.value)
         // console.log(' scroll left' ,scrollLeft.value)
         // console.log(' scroll max', maxScrollLeft.value)
         // console.log(' scroll to' ,scrollTo.value)


          if(scrollingDirection.value == 'left') {
            requestAnimationFrame(() => {
              containerRef.value!.scrollLeft = containerRef.value!.scrollLeft - timelineContext.scrollStep 
            })
          } else {
            requestAnimationFrame(() => {
              containerRef.value!.scrollLeft = containerRef.value!.scrollLeft + timelineContext.scrollStep 
            })
          }

          scrollBarPos.value = containerRef.value.scrollLeft

        }
      }, timelineContext.scrollVelocity)
      cleanup(() => clearInterval(id))
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
            onWheel$={(ev, currentTarget) => {
              scrollingDirection.value = ev.deltaY < 0 ? 'left' : 'right';
              scrollLeft.value = currentTarget.scrollLeft
              scrollTo.value = scrollLeft.value + ev.deltaY;
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
