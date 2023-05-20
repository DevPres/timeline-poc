import {  component$, useVisibleTask$, } from '@builder.io/qwik';
import { DocumentHead, useNavigate } from '@builder.io/qwik-city';


 
export default component$(() => {
    const nav = useNavigate();

    return (
        <>
        <button
        onclick$={async () => {
          // spa navigate to /dashboard
          await nav('/timeline');
        }}
      >
        go to timeline 
      </button>
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
