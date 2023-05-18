import { component$, useTask$,  useSignal, type PropFunction, useContext, useVisibleTask$, $, QwikMouseEvent } from '@builder.io/qwik';
import styles from "./horizontal-timeline.module.css";
import { isServer } from '@builder.io/qwik/build'
import { TIMELINECONTEXT } from '~/routes';

export default component$(() => {
    
    const timelineContext= useContext(TIMELINECONTEXT);
    const timelineStateClass = useSignal<string | null>(null);
    const circleDiameter = 120;
    const containerRef = useSignal<Element>();


    useTask$(({ track }) => {
      const yearSelected = track(() => timelineContext.yearSelected)
      
      timelineContext.state = !yearSelected ? 'open' : 'closed'
    })

    useTask$(({ track }) => {
      const container = track(() => containerRef.value)
      if(isServer) {
        return;
      }
      console.log('innerwidth', container?.scrollWidth)
    })


    useVisibleTask$(({ track }) => {
      const timelineState = track(() => timelineContext.state);
      requestAnimationFrame(() => {
        switch(timelineState) {
          case 'closed':
            timelineStateClass.value = styles.closed;
            break;
          case 'open':
            timelineStateClass.value = styles.open;
            break;
        }  
        if(timelineState == 'open') {
          timelineContext.hidden = false;
        } else {
          setTimeout(() => {
            timelineContext.hidden = true;
          }, 3000)
        }
      })
    })
    
    return (
        <>
          <span>{timelineContext.yearSelected}</span>
          <div 
            ref={containerRef}
            style={{
              '--circle-diameter': `${circleDiameter}px`,  
              'width': `${( timelineContext.years.length + 1 ) * ( circleDiameter + 100 )}px` 
            }} 
            class={styles['timeline-container']}
          >
            <div class={[
              styles.timeline,
              timelineStateClass.value,
              timelineContext.hidden ? styles.hidden : styles.visible
            ]}>
            {timelineContext.years.map((year) => (
              <Circle year={year} selected={ year == timelineContext.yearSelected} clickHandler$={() =>  {timelineContext.yearSelected = year; } }/>
            ))}    
            </div>
          </div>
        </>
    );
});

interface CircleProps {
  year: string;
  selected: boolean
  clickHandler$: PropFunction<() => void>
}


const Circle = component$<CircleProps>(({year, selected, clickHandler$}) => {
    
        
    return (
      <>
        <div 
          onClick$={[
            $((ev: QwikMouseEvent, currentTarget: HTMLElement) => {console.log(currentTarget.getBoundingClientRect())}),
            clickHandler$, 
            $((ev: QwikMouseEvent) => ev.stopPropagation())
          ]}  
          class={[ styles.circle, {[styles.selected]: selected} ]}
        >
          <span>{year}</span>
        </div>
      </>
    )
})

