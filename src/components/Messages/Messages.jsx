import {LinearProgress, makeStyles, Snackbar} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {close, handle_obsolete} from '../../core/store/slices/MessagesSlice';
import store from '../../core/store/store';

const useStyles = makeStyles({
  root: {
    width: '100%',
    marginTop: '10px',
  },
});

function Linear({message}) {
  const [progress, setProgress] = useState(100);
  const classes = useStyles();
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress === 0) {
          clearInterval(timer);
          dispatch(close(message));
          return 0;
        }
        return oldProgress - 5;
      });
    }, 333);

    return () => {
      clearInterval(timer);
    };
  }, [dispatch, message]);

  return (
    <div className={classes.root}>
      <LinearProgress variant="determinate" value={progress}/>
    </div>
  );
}

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
      <div>
        {messages.items.map((message, index) => {
          return (
            <Snackbar open={message.open} key={index} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
              <Alert
                variant="filled"
                icon={false}
                severity={message.severity}
                onClose={handleClose(message)}
                style={{wordBreak: 'break-word'}}
              >
                <AlertTitle>{message.title}</AlertTitle>
                {message.text}
                <Linear message={message}/>
              </Alert>
            </Snackbar>
          );
        })}
      </div>
    </div>
  );
}
window.setInterval(() => {
  store.dispatch(handle_obsolete());
}, 60000);
export default Messages;
