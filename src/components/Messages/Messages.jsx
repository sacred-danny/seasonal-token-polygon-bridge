import {LinearProgress, makeStyles, Snackbar} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {close, handle_obsolete} from '../../core/store/slices/MessagesSlice';
import store from '../../core/store/store';

const useStyles = makeStyles({
  // root: {
  //   width: '100%',
  //   marginTop: '10px',
  // },
});
// A component that displays error messages
function Messages() {
  const messages = useSelector(state => state?.messages);
  const dispatch = useDispatch();
  // Returns a function that can closes a message
  const handleClose = function (message) {
    return function () {
      dispatch(close(message));
    };
  };
  return (
    <div>
      <div className="flex flex-col messageBox">
        {messages.items.map((message, index) => {
          return (
            <Snackbar open={message.open} key={index} anchorOrigin={{vertical: 'top', horizontal: 'center'}} className="static mx-auto">
              <Alert
                variant="filled"
                icon={false}
                severity={message.severity}
                onClose={handleClose(message)}
                style={{wordBreak: ' break-word'}}
              >
                <AlertTitle>{message.title}</AlertTitle>
                {message.text}
              </Alert>
            </Snackbar>
          );
        })}
      </div>
    </div>
  );
}
window.setInterval(() => {
  // store.dispatch(handle_obsolete());
}, 60000);
export default Messages;
