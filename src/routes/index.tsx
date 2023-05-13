import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import type { DocumentHead  } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import Timeline from '~/components/timeline/timeline';
import { isServer } from '@builder.io/qwik/build';
import styles from './index.module.css';

export const ages=
[
  '1980',
  '1985',
  '1990',
  '2011'
]

export const useAgesLoader = routeLoader$(() => {
  return ages;
});




export default component$(() => {
    const ages = useAgesLoader();
    const ageSelected = useSignal<string | null>(null)

    useTask$(({ track }) => {
      track(() => ageSelected.value);
      if (isServer || !ageSelected.value) {
        return;
      }
      debugger;
    });

    return (
        <>
          <div class={styles.container}>
            <Timeline ageChangeHandler$={(age) => {ageSelected.value = age} }      ages={ages.value}/>                 
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
