import { component$, useTask$,  useSignal, type PropFunction, useContext, useVisibleTask$, $, QwikMouseEvent } from '@builder.io/qwik';
import styles from "./horizontal-timeline.module.css";
import { isServer } from '@builder.io/qwik/build'
import { TIMELINECONTEXT } from '~/routes/timeline/[yearSelected]';

export default component$(() => {
    
    const timelineContext= useContext(TIMELINECONTEXT);
    const timelineStateClass = useSignal<string | null>(null);
    const containerRef = useSignal<Element>();
    
    useTask$(({ track }) => {
      timelineContext.state = 'open';
    })


    useVisibleTask$(({ track, cleanup  }) => {
      const yearSelected = track(() => timelineContext.yearSelected);
      let id: NodeJS.Timer;
      if(yearSelected) {
        const id = setTimeout(() => {
            timelineContext.state = 'closed';
        }, 2000)
      }
      
      cleanup(() => clearTimeout(id))
    })

    useVisibleTask$(({ track }) => {
      const timelineState = track(() => timelineContext.state);
      let id: NodeJS.Timer;
      requestAnimationFrame(() => {
        switch(timelineState) {
          case 'closed':
            timelineStateClass.value = styles.closed;
            timelineContext.timelineWidth = '100%';
            break;
          case 'open':
            timelineStateClass.value = styles.open;
            timelineContext.timelineWidth = `${(timelineContext.years.length + 1 ) * ( timelineContext.circleDiameter + 100 )}px`;
            break;
        } 
        if(timelineState == 'open') {
          timelineContext.hidden = false;
        } else {
          id = setTimeout(() => {
          timelineContext.hidden = true
          }, 2800)
        }
       })
    })

    
    return (
        <>
          <span>{timelineContext.yearSelected}</span>
          {

          }
          <div 
            ref={containerRef}
            style={{
              '--circle-diameter': `${timelineContext.circleDiameter}px`,
              'width': timelineContext.timelineWidth,               
            }} 
            class={styles['timeline-container']}
          >
            <div 
            class={[
              styles.timeline,
              timelineStateClass.value,
              timelineContext.hidden ? styles.hidden : styles.visible
            ]}>
            {timelineContext.years.map((year) => (
              <div
                class={styles['circle-wrapper']}
                key={year}
              >
                <Circle year={year} yearSelected={ timelineContext.yearSelected } clickHandler$={() =>  {timelineContext.yearSelected = year; } }/>
              </div>
            ))}    
            </div>
          </div>
        </>
    );
});

interface CircleProps {
  year: string;
  yearSelected: string | null;
  clickHandler$: PropFunction<() => void>
}


const Circle = component$<CircleProps>(({year, yearSelected, clickHandler$}) => {

    return (
      <>
        <div
          onClick$={[
            clickHandler$, 
            $((ev: QwikMouseEvent) => ev.stopPropagation())
          ]}  
          class={[ styles.circle, {[styles.selected]: yearSelected && year == yearSelected || false, [styles.unselected]: yearSelected && year !== yearSelected || false  } ]}
        >
          <span>{year}</span>
        </div>
      </>
    )
})

