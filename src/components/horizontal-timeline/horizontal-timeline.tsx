import { component$, useTask$,  useSignal, type PropFunction, useContext, useVisibleTask$, $ } from '@builder.io/qwik';
import styles from "./horizontal-timeline.module.css";
import { TIMELINECONTEXT } from '~/routes';

export default component$(() => {
    
    const timelineContext= useContext(TIMELINECONTEXT);
    const timelineStateClass = useSignal<string | null>(null);

    useVisibleTask$(({ track }) => {
      const ageSelected = track(() => timelineContext.ageSelected)
      timelineContext.state = !ageSelected ? 'open' : 'closed'

    })

    useVisibleTask$(({ track }) => {
      const timelineState = track(() => timelineContext.state);
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
    
    return (
        <>
          <div class={styles['timeline-container']}>
            <span>{timelineContext.ageSelected}</span>
            <div class={[
            styles.timeline,
            timelineStateClass.value,
            timelineContext.hidden ? styles.hidden : styles.visible
            ]}>
            {timelineContext.ages.map((age) => (
                  <Circle selected={ age == timelineContext.ageSelected} clickHandler$={() =>  { timelineContext.ageSelected = age } }/>
                  ))}    
            </div>
          </div>
        </>
    );
});

interface CircleProps {
  selected: boolean
  clickHandler$: PropFunction<() => void>
}


const Circle = component$<CircleProps>(({selected, clickHandler$}) => {

        
    return (
      <>
        <div 
          onClick$={clickHandler$}  
          class={[ styles.circle, {[styles.selected]: selected} ]}
        ></div>
      </>
    )
})

