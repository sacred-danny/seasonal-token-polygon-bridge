import { Box, Modal, Fade } from "@material-ui/core";
import ReactLoading from "react-loading";

export const LoadingModal = (props: any):JSX.Element => {

    return (
      <Modal open={props.open}>
        <Fade in={props.open}>
          <Box className="load-modal outline-none" padding="20px">
            <Box ml="5px" className="flex justify-center"><ReactLoading type="spinningBubbles" color="#FACB99" width={ 50 } height={ 50 } /></Box>
          </Box>
        </Fade>
      </Modal>
    );

};