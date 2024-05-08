import { Link, redirect, useNavigate, useNavigation, useParams, useSubmit } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';

export default function EditEvent() {

  const params = useParams();
  const submit = useSubmit();
  const { state } = useNavigation();

  const navigate = useNavigate();

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;
  //     const cacheKey = ['events', params.id];

  //     await queryClient.cancelQueries({ queryKey: cacheKey });
  //     const previousEvent = queryClient.getQueryData(cacheKey);

  //     queryClient.setQueryData(cacheKey, newEvent);
  //     // this is context for onError
  //     return { previousEvent };
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(['events', params.id], context.previousEvent);

  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['events', params.id]);
  //   }
  // });

  function handleSubmit(formData) {
    //trigger action method
    submit(formData, { method: 'PUT' });
    // mutate({
    //   id: params.id,
    //   event: formData
    // });
    // navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  const { data, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000
  });

  let content;

  // if (isPending) {
  //   content = <div className='center'>
  //     <LoadingIndicator />
  //   </div>
  // }

  if (isError) {
    content = <>
      <ErrorBlock title="Failed to load the event" message="An error occured" />
      <div className='form-actions'>
        <Link to=".." className='button' >
          Okay
        </Link>
      </div>
    </>
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === 'submitting' ? <p>Sending data</p> :
          (
            <>
              <Link to="../" className="button-text">
                Cancel
              </Link>
              <button type="submit" className="button">
                Update
              </button>
            </>
          )}
      </EventForm>
    );
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updateEventData = Object.fromEntries(formData);

  await updateEvent({ id: params.id, event: updateEventData });

  await queryClient.invalidateQueries(['events']);
  return redirect('../');
}
