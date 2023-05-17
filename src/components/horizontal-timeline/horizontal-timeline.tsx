import { component$, useTask$,  useSignal, type PropFunction, useContext, useVisibleTask$, $ } from '@builder.io/qwik';
import styles from "./horizontal-timeline.module.css";
import { TIMELINECONTEXT } from '~/routes';

export default component$(() => {
    
    const timelineContext= useContext(TIMELINECONTEXT);
    const timelineStateClass = useSignal<string | null>(null);
    const circleDiameter = 120

    useVisibleTask$(({ track }) => {
      const yearSelected = track(() => timelineContext.yearSelected)
      timelineContext.state = !yearSelected ? 'open' : 'closed'

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
          }, 2000)
        }
      })
    })
    
    return (
        <>
          <span>{timelineContext.yearSelected}</span>
          <div 
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
              <Circle year={year} selected={ year == timelineContext.yearSelected} clickHandler$={() =>  {timelineContext.yearSelected = year } }/>
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
          onClick$={(ev) => {clickHandler$(); ev.stopPropagation()}}  
          class={[ styles.circle, {[styles.selected]: selected} ]}
        >
          {year}
        </div>
      </>
    )
})

