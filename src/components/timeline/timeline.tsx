import { component$, useTask$, useVisibleTask$, $, useSignal, type PropFunction } from '@builder.io/qwik';
import styles from "./timeline.module.css";
import { isServer } from '@builder.io/qwik/build';

interface TimelineProps {
  ages: string[];
  ageChangeHandler$: PropFunction<(age: string) => void>
}
 
export default component$<TimelineProps>((props) => {
    
    const timelineHorizontal = useSignal(true);
    const ageSelected=useSignal<string | null>(null)
    
    useTask$(({ track }) => {
      track(() => ageSelected.value);
      if (isServer || !ageSelected.value) {
        return;
      }
      debugger;
      props.ageChangeHandler$(ageSelected.value)
    });

    return (
        <>
          <div class={styles.timeline}>
            {props.ages.map((age) => (
              <Circle clickHandler$={() => {ageSelected.value = age}}/>
            ))}    
          </div>
        </>
    );
});

interface CircleProps {
  clickHandler$: PropFunction<() => void>
}


const Circle = component$<CircleProps>(({clickHandler$}) => {

    const over = useSignal(false)
    return (
      <>
        <div 
          onClick$={clickHandler$}  
          onMouseOver$={() => over.value = true} 
          onMouseLeave$={() => over.value = false}  
          class={[
            styles.circle,
            over.value ? styles.over : ""
          ]}
        ></div>
      </>
    )
})
